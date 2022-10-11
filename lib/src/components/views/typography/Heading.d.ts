import React, { HTMLAttributes } from 'react';
declare type Size = 'h1' | 'h2' | 'h3' | 'h4';
interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    size: Size;
}
declare const Heading: React.FC<HeadingProps>;
export default Heading;
