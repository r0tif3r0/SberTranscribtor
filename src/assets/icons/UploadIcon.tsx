import { FC } from 'react';
import { IconProps } from '../../interfaces/IIconProps';


export const UploadIcon: FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} viewBox="0 0 28 28" role="presentation" aria-label="upload" {...props}>
        <path d="M13.364 13.364a.9.9 0 0 1 1.273 0l4.666 4.667a.9.9 0 1 1-1.272 1.273L14 15.273l-4.03 4.03a.9.9 0 0 1-1.274-1.273z"></path>
        <path d="M14.002 13.1a.9.9 0 0 1 .9.9v10.5a.9.9 0 0 1-1.8 0V14a.9.9 0 0 1 .9-.9"></path>
        <path d="M10.118 2.61A10.23 10.23 0 0 1 20.203 9.6H21a6.735 6.735 0 0 1 6.168 9.425 6.73 6.73 0 0 1-2.949 3.22.9.9 0 0 1-.861-1.58A4.934 4.934 0 0 0 21 11.4h-1.469a.9.9 0 0 1-.871-.675A8.435 8.435 0 0 0 3.685 7.862a8.43 8.43 0 0 0 .49 10.559.9.9 0 1 1-1.348 1.192 10.234 10.234 0 0 1 7.29-17.003z"></path>
        <path d="M13.364 13.364a.9.9 0 0 1 1.273 0l4.666 4.667a.9.9 0 1 1-1.272 1.273L14 15.273l-4.03 4.03a.9.9 0 0 1-1.274-1.273z"></path>
    </svg>
)