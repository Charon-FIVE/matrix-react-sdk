import React, { DetailedHTMLProps, AnchorHTMLAttributes } from 'react';
interface Props extends DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
}
/**
 * Simple link component that adds external link icon after link children
 */
declare const ExternalLink: React.FC<Props>;
export default ExternalLink;
