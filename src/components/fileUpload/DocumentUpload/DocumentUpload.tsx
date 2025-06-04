import { useState, useCallback, FC } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import style from './DocumentUpload.module.scss';

import { AudioIcon } from '../../../assets/icons/AudioIcon';
import { UploadIcon } from '../../../assets/icons/UploadIcon';
import { NavButton } from '../../navButton/NavButton';
import { AddIcon } from '../../../assets/icons/AddIcon';
import { TrashIcon } from '../../../assets/icons/TrashIcon';
import { loadDocument } from '../../../api/axios.api';

interface UploadedFile extends File {
  id: string;
}

export const DocumentUpload: FC = () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragActive, setIsDragActive] = useState<boolean>(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
      const filesWithId = acceptedFiles.map((file) =>
        Object.assign(file, { id: uuidv4() })
      );
      setFiles((prev) => [...prev, ...filesWithId]);
      setIsDragActive(false);
    }, []);
  
    const { getRootProps, getInputProps, open } = useDropzone({
      onDrop,
      onDragEnter: () => setIsDragActive(true),
      onDragLeave: () => setIsDragActive(false),
      accept: {
        'application/pdf': ['.pdf'],
      },
      maxSize: 3 * 1024 * 1024, // до 3 МБ
    });
  
    const removeFile = (id: string) => {
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    };

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const channel = new BroadcastChannel('documents_channel');
  
    const handleSave = async () => {
      const fileRecords = files.map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        uploadTime: new Date().toISOString(),
        status: 'loading',
        text: null,
      }));
  
      const existing = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
      const updated = [...existing, ...fileRecords];
      localStorage.setItem('uploadedDocuments', JSON.stringify(updated));
      channel.postMessage({ type: 'update' });

      await Promise.allSettled(
        files.map(async (file) => {
          try {
            const text = await loadDocument(file, file.id);
    
            const savedFiles = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
            const modifiedFiles = savedFiles.map((f: any) =>
              f.id === file.id ? { ...f, status: 'success', text: text } : f
            );
            localStorage.setItem('uploadedDocuments', JSON.stringify(modifiedFiles));
            channel.postMessage({ type: 'update' });
    
          } catch (error) {
            const savedFiles = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
            const modifiedFiles = savedFiles.map((f: any) =>
              f.id === file.id ? { ...f, status: 'error', text: null } : f
            );
            localStorage.setItem('uploadedDocuments', JSON.stringify(modifiedFiles));
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
            <small>Поддерживаемые форматы: PDF — до 3MB</small>
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
                <p className={style.files__summary_title}>Общий объем:</p>
                <p className={style.files__summary_value}>
                    {(totalSize / 1024 / 1024).toFixed(2)} MB
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
                            {(file.size / 1024 / 1024).toFixed(2)} MB
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

              </div>
              <div>
                <NavButton 
                  className={style.continue_btn} 
                  label={'Продолжить'} 
                  path={'/documents'}
                  onClick={handleSave}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};