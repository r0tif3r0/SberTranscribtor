import { FC } from 'react';
import { IconProps } from '../../interfaces/IIconProps';


export const LogoIcon: FC<IconProps> = ({ className, ...props  }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" {...props}>
           <path d="M30.87 30.09 19.103 22.7v8.89l11.769 7.39 28.17-20.792a31 31 0 0 0-3.705-6.155z"/><path d="M61.646 30.963c0-1.894-.17-3.747-.494-5.547l-6.634 4.912q.008.316.008.635c0 13.13-10.633 23.81-23.703 23.81S7.12 44.094 7.12 30.964s10.633-23.81 23.703-23.81c4.953 0 9.556 1.535 13.363 4.155l5.995-4.439A30.6 30.6 0 0 0 30.823 0C13.8 0 0 13.863 0 30.963s13.8 30.963 30.823 30.963 30.823-13.862 30.823-30.963"/>
    </svg>
)