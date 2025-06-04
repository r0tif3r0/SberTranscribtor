import { FC } from 'react';
import { IconProps } from '../../interfaces/IIconProps';

export const CollapseIcon: FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
)