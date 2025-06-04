import style from './Page.module.scss';
import { FC, ReactNode } from 'react';
import { Header } from '../../components/header/Header';
import { Sidebar } from '../../components/sidebar/Sidebar';

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
    header: boolean;
    sidebar: boolean;
    children?: ReactNode;
}

export const Page: FC<PageProps> = ({
    header,
    sidebar,
    children,
    ...rest
}) => {


    return (
        <>
            {header && <Header/>}
            <div className={style.main}>
                {sidebar && <Sidebar/>}
                <div className={style.workspace} {...rest}>
                    {children}
                </div>
            </div>
        </>
    )
}