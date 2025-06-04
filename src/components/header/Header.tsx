import { FC } from 'react'
import style from './Header.module.scss';
import { Link } from 'react-router-dom';

import { AudioIcon } from '../../assets/icons/AudioIcon'
import { DocumentIcon } from '../../assets/icons/DocumentIcon';
import { HelpIcon } from '../../assets/icons/HelpIcon';
import { LogoIcon } from '../../assets/icons/LogoIcon';

export const Header: FC = () => {

  return (
    <div className={style.header}>
        <header className={style.header__container}>
            <Link className={style.header__name} to={'/'}>
                <div className={style.header__logo}>
                    <LogoIcon className={style.header__logo_image}/>
                    <span className={style.header__logo_text}>LEGAL ALLY</span>
                </div>
            </Link>
            <div className={style.header__actions}>
                <div className={style.services}>
                    <Link className={style.audio} to={'/audios'} title='Мои аудиофайлы'>
                        <AudioIcon className={style.audio_icon}/>
                    </Link>
                    <Link className={style.documents} to={'/documents'} title='Мои документы'>
                        <DocumentIcon className={style.document_icon}/>
                    </Link>
                    <Link className={style.help} to={'/help'} title='Помощь'>
                        <HelpIcon className={style.help_icon}/>
                    </Link>
                </div>
            </div>
        </header>
    </div>
  );
}