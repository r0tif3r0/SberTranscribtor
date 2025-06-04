import style from './TextUploadPage.module.scss';
import { FC } from 'react';
import { Page } from '../../components/page/Page';
import { DocumentUpload } from '../../components/fileUpload/DocumentUpload/DocumentUpload';


export const TextUploadPage: FC = () => {


    return (
        <>
            <Page header sidebar>
                <div className={style.upload}>
                    <p>Загрузка аудиофайлов</p>
                    <DocumentUpload/>
                </div>
            </Page>
        </>
    )
}