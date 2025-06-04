import { FC, ReactElement } from 'react'
import style from './SidebarItem.module.scss';
import { NavLink } from 'react-router-dom';
import cn from 'classnames';

interface SidebarItemProps {
    icon: ReactElement,
    label: string,
    path: string;
}

export const SidebarItem: FC<SidebarItemProps> = ({
    icon,
    label,
    path
}) => {

  return (
    <li className={style.sidebar__item}>
        <NavLink
        end
        className={({ isActive }) => cn(
            style.sidebar__link,
            isActive && style.active
        )}
        to={path}
        >
            {icon}
            <span className={style.sidebar__label}>{label}</span>
        </NavLink>
    </li>
  );
}