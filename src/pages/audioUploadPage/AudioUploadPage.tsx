import style from './AudioUploadPage.module.scss';
import { FC } from 'react';
import { Page } from '../../components/page/Page';
import { AudioFileUpload } from '../../components/fileUpload/audioFileUpload/AudioFileUpload';


export const AudioUploadPage: FC = () => {


    return (
        <>
            <Page header sidebar>
                <div className={style.upload}>
                    <p>Загрузка аудиофайлов</p>
                    <AudioFileUpload/>
                </div>
            </Page>
        </>
    )
}