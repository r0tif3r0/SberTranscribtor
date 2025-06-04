import { useState, useCallback, FC } from 'react';
import { useDropzone } from 'react-dropzone';
import { transcribeFile } from '../../../api/axios.api';
import cn from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import style from './AudioFileUpload.module.scss';

import { AudioIcon } from '../../../assets/icons/AudioIcon';
import { UploadIcon } from '../../../assets/icons/UploadIcon';
import { NavButton } from '../../navButton/NavButton';
import { AddIcon } from '../../../assets/icons/AddIcon';
import { TrashIcon } from '../../../assets/icons/TrashIcon';
import { formatDuration } from '../../../utils/Format';

interface FileWithDuration extends File {
  duration: number;
  id: string;
}

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    };
    
    audio.onerror = () => {
      reject(new Error('Failed to load audio'));
      URL.revokeObjectURL(url);
    };
  });
};

export const AudioFileUpload: FC = () => {
  const [files, setFiles] = useState<FileWithDuration[]>([]);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [diarize, setDiarize] = useState<boolean>(false);
  const [grammar, setGrammar] = useState<boolean>(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const filesWithDuration = await Promise.all(
      acceptedFiles.map(async (file) => {
        let duration = 0;
        try {
          duration = await getAudioDuration(file);
        } catch (error) {
          console.error('Error getting audio duration:', error);
        }
        return Object.assign(file, { duration, id: uuidv4()});
      })
    );
    
    setFiles(prev => [...prev, ...filesWithDuration]);
    setIsDragActive(false);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const totalDuration = files.reduce((sum, file) => sum + file.duration, 0);

  const channel = new BroadcastChannel('audio_files_channel');

  const handleTranscribe = async () => {

    const fileRecords = files.map((file) => ({
      id: file.id,
      name: file.name,
      duration: file.duration,
      diarize,
      uploadTime: new Date().toISOString(),
      status: 'loading',
      transcript: null,
    }));

    const existing = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    const updated = [...existing, ...fileRecords];
    localStorage.setItem('uploadedFiles', JSON.stringify(updated));
    channel.postMessage({ type: 'update' });

    await Promise.allSettled(
      files.map(async (file) => {
        try {
          const segments = await transcribeFile(file, diarize, grammar);
  
          const savedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
          const modifiedFiles = savedFiles.map((f: any) =>
            f.id === file.id ? { ...f, status: 'success', transcript: segments } : f
          );
          localStorage.setItem('uploadedFiles', JSON.stringify(modifiedFiles));
          channel.postMessage({ type: 'update' });
  
        } catch (error) {
          const savedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
          const modifiedFiles = savedFiles.map((f: any) =>
            f.id === file.id ? { ...f, status: 'error', transcript: null } : f
          );
          localStorage.setItem('uploadedFiles', JSON.stringify(modifiedFiles));
          channel.postMessage({ type: 'update' });
        }
      })
    );

  };


  return (
    <div className={style.upload__container}>
      <input {...getInputProps()} />

      {files.length === 0 && (
        <div 
          {...getRootProps()} 
          className={`${style.dropzone} ${isDragActive ? style.active : ''}`}
        >
          <div className={style.upload__content}>
            <UploadIcon className={style.upload__icon}/>
            <p>Перетащите файлы сюда или нажмите для выбора</p>
            <small>Поддерживаемые форматы: MP3, M4A, WAV — до 50MB</small>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className={style.files}>
          <div className={style.files__container}>
            <div className={style.files__summary}>
              <div className={style.files__summary_info}>
                <p className={style.files__summary_title}>Ваши файлы:</p>
                <p className={style.files__summary_value}>{files.length}</p>
              </div>
              <div className={style.files__summary_info}>
                <p className={style.files__summary_title}>Общая длительность:</p>
                <p className={style.files__summary_value}>
                  {formatDuration(totalDuration)}
                </p>
              </div>
            </div>
            <div className={style.files__list}>
              <div className={style.files__list_wrapper}>
                {files.map((file) => (
                  <div key={file.name} className={style.file__container}>
                    <div className={style.file__item}>
                      <div className={style.icon__container}>
                        <AudioIcon className={style.icon}/>
                      </div>
                      <div className={style.file__info}>
                        <span className={style.file__name}>{file.name}</span>
                        <div className={style.file__properties}>
                          <span>
                            {(file.size / 1024 / 1024).toFixed(2)} MB · {' '}
                            {formatDuration(file.duration)}
                          </span>
                        </div>
                      </div>
                      <div className={style.btn__container}>
                        <button 
                          onClick={() => removeFile(file.id)}
                          className={style.btn__remove}
                          title='Удалить'
                        >
                          <TrashIcon/>
                        </button>
                      </div>
                    </div>
                  </div>   
                ))}
                <div>
                  <button
                    onClick={open}
                    className={style.btn__add}
                  >
                    <AddIcon/>
                    Загрузить еще
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={style.upload__settings}>
            <div className={style.settings__container}>
              <div className={style.settings__item}>
                <div className={style.settings__label}>
                    <label>Разделение на спикеров:</label> 
                </div>
                <div className={style.settings__item_options}>
                    <button
                    className={cn(style.btn__setting, { [style.active]: diarize })}
                    onClick={() => setDiarize(true)}
                    >
                    Разделять
                    </button>
                    <button
                    className={cn(style.btn__setting, { [style.active]: !diarize })}
                    onClick={() => setDiarize(false)}
                    >
                    Не разделять
                    </button>
                </div>
              </div>
              <div className={style.settings__item}>
                <div className={style.settings__label}>
                    <label>Пунктуация и грамматика:</label> 
                </div>
                <div className={style.settings__item_options}>
                    <button
                    className={cn(style.btn__setting, { [style.active]: grammar })}
                    onClick={() => setGrammar(true)}
                    >
                    Да
                    </button>
                    <button
                    className={cn(style.btn__setting, { [style.active]: !grammar })}
                    onClick={() => setGrammar(false)}
                    >
                    Нет
                    </button>
                </div>
              </div>
            </div>
            <div>
                <NavButton 
                  className={style.continue_btn} 
                  label={'Продолжить'} 
                  path={'/audios'}
                  onClick={handleTranscribe}
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};