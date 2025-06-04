import style from './AudioFilesPage.module.scss';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { Page } from '../../components/page/Page';
import { AddIcon } from '../../assets/icons/AddIcon';
import { NavButton } from '../../components/navButton/NavButton';
import { AudioIcon } from '../../assets/icons/AudioIcon';
import { TrashIcon } from '../../assets/icons/TrashIcon';
import { ExportIcon } from '../../assets/icons/ExportIcon';
import { formatDate, formatDuration } from '../../utils/Format';
import {exportToDocx} from '../../utils/Export'
import { UploadedAudioFile } from '../../interfaces/IUploadedAudioFile';

const channel = new BroadcastChannel('audio_files_channel');

export const AudioFilesPage: FC = () => {

    const [uploadedFiles, setUploadedFiles] = useState<UploadedAudioFile[]>([]);
    const navigate = useNavigate();
    const [fileToDelete, setFileToDelete] = useState<UploadedAudioFile | null>(null);
    const [modalState, setModalState] = useState<'show' | 'hiding' | null>(null);
    const [modalMode, setModalMode] = useState<'single' | 'multiple' | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const openDeleteModal = (file: UploadedAudioFile, e: React.MouseEvent) => {
        e.stopPropagation();
        setFileToDelete(file);
        setModalMode('single');
        setModalState('show');
    };

    const openDeleteMultipleModal = () => {
        setModalMode('multiple');
        setModalState('show');
    };

    const closeDeleteModal = () => {
    setModalState('hiding');
    setTimeout(() => {
        setModalState(null);
        setFileToDelete(null);
    }, 200);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
      };
    
    const loadFiles = () => {
        const saved = localStorage.getItem('uploadedFiles');
        if (saved) {
          try {
            const parsed: UploadedAudioFile[] = JSON.parse(saved);
            setUploadedFiles(parsed);
          } catch (e) {
            console.error('Ошибка при чтении uploadedFiles из localStorage', e);
          }
        }
    };
    
    useEffect(() => {
        loadFiles();
    
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'update') {
            loadFiles();
          }
        };
    
        channel.addEventListener('message', handleMessage);
    
        return () => {
          channel.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleRemove = (id: string) => {
        const updated = uploadedFiles.filter(file => file.id !== id);
        setUploadedFiles(updated);
        localStorage.setItem('uploadedFiles', JSON.stringify(updated));
        channel.postMessage({ type: 'update' });
    };

    const handleRemoveSel = () => {
        const updated = uploadedFiles.filter(file => !selectedIds.includes(file.id));
        setUploadedFiles(updated);
        localStorage.setItem('uploadedFiles', JSON.stringify(updated));
        setSelectedIds([]);
        channel.postMessage({ type: 'update' });
    };

    const handleExport = (file: UploadedAudioFile, e: React.MouseEvent) => {
        e.stopPropagation();
        exportToDocx(file.transcript, file.name);
    }

    return (
        <>
            {modalState && (
            <div
                className={cn(style.modal__overlay, { [style.hide]: modalState === 'hiding' })}
                onClick={closeDeleteModal}
            >
                <div
                className={cn(style.modal, { [style.hide]: modalState === 'hiding' })}
                onClick={(e) => e.stopPropagation()}
                >
                {modalMode === 'single' && fileToDelete && (
                    <>
                    <p>Удалить файл <b>{fileToDelete.name}</b>?</p>
                    <div className={style.modal__actions}>
                        <button
                        onClick={() => {
                            handleRemove(fileToDelete.id);
                            closeDeleteModal();
                        }}
                        className={style.btn__confirm}
                        >
                        Да
                        </button>
                        <button onClick={closeDeleteModal} className={style.btn__cancel}>Нет</button>
                    </div>
                    </>
                )}

                {modalMode === 'multiple' && (
                    <>
                    <p>Удалить выбранные файлы (<b>{selectedIds.length}</b>)?</p>
                    <div className={style.modal__actions}>
                        <button
                        onClick={() => {
                            handleRemoveSel();
                            closeDeleteModal();
                        }}
                        className={style.btn__confirm}
                        >
                        Да
                        </button>
                        <button onClick={closeDeleteModal} className={style.btn__cancel}>Нет</button>
                    </div>
                    </>
                )}
                </div>
            </div>
            )}
            <Page header sidebar>
                <div className={style.audio_list}>
                    <div className={style.audio_list_title}>
                        <p className={style.audio_list__label}>Все Аудиофайлы</p>
                        <NavButton className={style.add_audio__button} icon={<AddIcon className={style.add_audio__icon}/>} label='Загрузить файлы' path='/audios/upload'/>
                    </div>
                    <div className={style.audio_list__table}>
                        <div className={style.table__container}>
                            <button
                                className={style.btn__delete_sel}
                                style={{ visibility: selectedIds.length > 0 ? 'visible' : 'hidden' }}
                                onClick={openDeleteMultipleModal}
                            >
                                <p>Удалить выбранные <b>({selectedIds.length})</b></p>
                            </button>
                            <table className={style.table}>
                                <thead>
                                    <tr>
                                        <th><span>Название</span></th>
                                        <th><span>Длительность</span></th>
                                        <th><span>Разделение</span></th>
                                        <th><span>Дата</span></th>
                                        <th><span>Статус</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uploadedFiles.map((file) => (
                                    <tr
                                        className={cn(style.table__item, {
                                        [style.disabled]: file.status === 'loading',
                                        [style.selected]: selectedIds.includes(file.id)
                                        })}
                                        key={file.id}
                                        onClick={() => {
                                        if (file.status !== 'loading') navigate(`/audios/${file.id}`);
                                        }}
                                    >
                                        <td className={style.title__container}>
                                            <div className={style.title}>
                                                <div
                                                    className={cn(style.icon__wrapper, {
                                                    [style.loading]: file.status === 'loading',
                                                    [style.success]: file.status === 'success',
                                                    [style.error]: file.status === 'error',
                                                    })}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (file.status !== 'loading') toggleSelect(file.id);
                                                    }}
                                                >
                                                    <div className={style.icon__container}>
                                                        <AudioIcon />
                                                    </div>
                                                </div>
                                                <div className={style.name__container}>
                                                    <p>
                                                        {file.name}
                                                    </p>
                                                </div>
                                                <div className={style.buttons__container}>
                                                    <button
                                                        className={style.btn__remove}
                                                        title="Удалить"
                                                        disabled={file.status === 'loading'}
                                                        onClick={(e) => {
                                                            if (file.status !== 'loading') openDeleteModal(file, e);
                                                        }}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                    <button
                                                        className={style.btn__export}
                                                        title='Эксортировать'
                                                        disabled={file.status === 'loading'}
                                                        onClick={(e) => {
                                                            if (file.status !== 'loading') handleExport(file, e);
                                                        }}
                                                    >
                                                        <ExportIcon/>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span>{formatDuration(file.duration)}</span>
                                        </td>
                                        <td>
                                            <span>{file.diarize ? 'Да' : 'Нет'}</span>
                                        </td>
                                        <td>
                                            <p>{formatDate(file.uploadTime)}</p>
                                        </td>
                                        <td>
                                            <span
                                            className={cn(
                                                { [style.loading]: file.status === 'loading' },
                                                { [style.success]: file.status === 'success' },
                                                { [style.error]: file.status === 'error' },
                                            )}
                                            >
                                                {file.status === 'loading' && 'Обработка'}
                                                {file.status === 'success' && 'Готово'}
                                                {file.status === 'error' && 'Ошибка'}
                                            </span>
                                        </td>
                                    </tr>
                                    ))}
                                    {uploadedFiles.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className={style.no_files_info}>
                                        Нет загруженных файлов
                                        </td>
                                    </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Page>
        </>
    )
}