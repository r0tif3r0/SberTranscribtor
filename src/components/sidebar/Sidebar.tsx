import { FC } from 'react'
import style from './Sidebar.module.scss';

import { SidebarItem } from '../sidebarItem/SidebarItem';
import { AudioIcon } from '../../assets/icons/AudioIcon';
import { DocumentIcon } from '../../assets/icons/DocumentIcon';
import { HelpIcon } from '../../assets/icons/HelpIcon';
import { AnaliticIcon } from '../../assets/icons/AnaliticIcon';
import { SettingsIcon } from '../../assets/icons/SettinsIcon';

export const Sidebar: FC = () => {

  return (
    <aside className={style.sidebar}>
        <nav className={style.sidebar__nav}>
            <ul className={style.sidebar__menu}>
                <SidebarItem icon={<AudioIcon className={style.sidebar__icon}/>} label='Мои Аудиофайлы' path='/audios'/>
                <SidebarItem icon={<DocumentIcon className={style.sidebar__icon}/>} label='Мои Документы' path='/documents'/>
                <SidebarItem icon={<AnaliticIcon className={style.sidebar__icon}/>} label='Аналитика' path='/analytics'/>
                <SidebarItem icon={<SettingsIcon className={style.sidebar__icon}/>} label='Настройки' path='/settings'/>
                <SidebarItem icon={<HelpIcon className={style.sidebar__icon}/>} label='Помощь' path='/help'/>
            </ul>
        </nav>
    </aside>
  );
}