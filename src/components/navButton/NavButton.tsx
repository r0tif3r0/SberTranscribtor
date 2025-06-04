import style from './NavButton.module.scss';
import { FC, ReactElement, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';

interface NavButtonProps {
    className?: string;
    icon?: ReactElement;
    label: string;
    path: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export const NavButton: FC<NavButtonProps> = ({
    className,
    icon,
    label,
    path,
    onClick,
    ...props
}) => {
    
    return (
        <Link
            className={cn(style.btn, className)}
            to={path}
            onClick={onClick}
            {...props}
        >
            {icon}
            <span className={style.button__label}>{label}</span>
        </Link>
    );
};