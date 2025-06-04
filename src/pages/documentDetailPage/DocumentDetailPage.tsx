import { FC, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import style from './DocumentDetailPage.module.scss';
import cn from 'classnames'

import { Page } from '../../components/page/Page';
import { DateIcon } from '../../assets/icons/DateIcon';
import { formatDate } from '../../utils/Format';
import { UploadedDocumentFile } from '../../interfaces/IUploadedDocumentFile';
import { summarizeText } from '../../api/axios.api';
import { Loader } from '../../components/loader/Loader';
import { AIChat } from '../../components/AIChat/AIChat';
import { CollapseIcon } from '../../assets/icons/CollapseIcon';
import { useAnimatedHeight } from '../../utils/useAnimatedHeight';
import { PDFPage } from '../../interfaces/IPDFPage';

export const DocumentsDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<UploadedDocumentFile | null>(null);
  const [isTranscribationCollapsed, setIsTranscribationCollapsed] = useState<boolean>(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState<boolean>(false);
  const [summarizationStatus, setSummarizationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentSummarizationError, setCurrentSummarizationError] = useState<string | null>(null);

  const summarizationOutputRef = useRef<HTMLDivElement>(null);
   
  const transcribationRef = useAnimatedHeight(!isTranscribationCollapsed);
  const summaryRef = useAnimatedHeight(!isSummaryCollapsed);

  const channel = new BroadcastChannel('audio_files_channel');


  useEffect(() => {
    const loadFile = () => {
      const stored = localStorage.getItem('uploadedDocuments');
      if (stored) {
        const files: UploadedDocumentFile[] = JSON.parse(stored);
        const found = files.find((f) => f.id === id);
        setFile(found || null);

        if (found?.summarizedText) {
          setSummarizationStatus('success');
        } else {
          setSummarizationStatus('idle');
        }
        setCurrentSummarizationError(null);
      }
    };

    loadFile();

    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'update') {
        loadFile();
      }
    };

    return () => {
      channel.onmessage = null;
    };
  }, [id]);

//   useEffect(() => {
//     document.querySelectorAll(`.${style.highlight}`).forEach(el =>
//       el.classList.remove(style.highlight)
//     );

//     if (!activeSegments) return;

//     if (!isTranscribationCollapsed) {
//       scrollToSegment(activeSegments);
//     } else {
//       setIsTranscribationCollapsed(false);
//     }
//   }, [activeSegments]);

//   useEffect(() => {
//     if (!activeSegments || isTranscribationCollapsed) return;

//     const timeout = setTimeout(() => {
//       scrollToSegment(activeSegments);
//     }, 310);

//     return () => clearTimeout(timeout);
//   }, [isTranscribationCollapsed]);

//   const scrollToSegment = (segments: { segment: TranscribationSegment; key: number }[]) => {
//     if (!segments.length) return;

//     const first = segments[0];
//     const firstId = `segment-${first.segment.start}-${first.segment.end}`;
//     const firstEl = document.getElementById(firstId);
//     if (firstEl) {
//       firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }

//     segments.forEach(({ segment }) => {
//       const id = `segment-${segment.start}-${segment.end}`;
//       const el = document.getElementById(id);
//       if (el) {
//         el.classList.add(style.highlight);
//       }
//     });
//   };

  const handleSummarize = async () => {

    if (!file || !file.text || !Array.isArray(file.text) || file.text.length === 0) {
      setCurrentSummarizationError('Нет данных для суммаризации.');
      setSummarizationStatus('error');
      return;
    }

    setIsSummaryCollapsed(false);
    setSummarizationStatus('loading');
    setCurrentSummarizationError(null);

    // const segments: PDFPage[] = file.text.map(segment => ({
    //   page: segment.page,
    //   content: segment.content,
    // }));

    // try {
    //   const summary = await summarizeText(segments);

    //   setFile(prevFile => {
    //     if (!prevFile) return null;
    //     const updatedFile = { ...prevFile, summarizedText: summary };

    //     const storedFiles: UploadedDocumentFile[] = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    //     const updatedFiles = storedFiles.map(f =>
    //       f.id === updatedFile.id ? updatedFile : f
    //     );
    //     localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    //     channel.postMessage({ type: 'update' });

    //     return updatedFile;
    //   });

    //   setSummarizationStatus('success');

    // } catch (error: any) {
    //   console.error('Ошибка при суммаризации:', error);
    //   setCurrentSummarizationError(error.message || 'Не удалось получить суммаризацию.');
    //   setSummarizationStatus('error');
    // }
  };


  if (!file) {
    return <Page header sidebar={false}>Файл не найден</Page>;
  }

  return (
    <Page header sidebar={false} style={{ width: '100%', height: '100%'}}>
      <div className={style.detail}>
        <div className={style.detail__container}>
            <div className={style.transcribation}>
                <div className={style.transcribation__info}>
                    <div className={style.file_name}>
                        <p>{file.name}</p>
                    </div>
                    <div className={style.file__properties}>
                        <div className={style.property}>
                            <DateIcon/>
                            <p>{formatDate(file.uploadTime)}</p>
                        </div>
                    </div>
                </div>
                <div className={style.buttons__container}></div>

                {file.status === 'success' && Array.isArray(file.text) && (
                    <div className={style.transcribation__text}>
                        <div
                            className={style.title}
                        >
                          <div 
                            className={style.title__container}
                            onClick={() => setIsTranscribationCollapsed(!isTranscribationCollapsed)}
                            role="button"
                            tabIndex={0}
                            aria-expanded={!isTranscribationCollapsed}
                            title="Показать/скрыть текст"
                          >
                            <p>Текст документа</p>
                            <CollapseIcon className={`${style.icon} ${isTranscribationCollapsed ? style.collapsed : ''}`}/>
                          </div>
                        </div>
                        <div
                          ref={transcribationRef}
                          className={style.text__container}
                          style={{ transition: 'height 0.3s ease' }}
                        >
                            {file.text.map((segment, index) => (
                            <div 
                              key={index} 
                              className={style.transcribation__block}
                            >
                                <div className={style.segment__title}>
                                    {segment.page && (
                                    <div className={cn(style.segment__info, style.speaker)}>
                                        {`Страница ${segment.page}`}
                                    </div>
                                    )}
                                </div>
                                <div className={style.text}>{segment.content}</div>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Блок для отображения статуса суммаризации */}
                <div ref={summarizationOutputRef} className={style.transcribation__text}>
                    <div className={style.title}>
                    {(summarizationStatus === 'idle' && !file?.summarizedText) ? (
                        <div 
                        className={style.title__container}
                        style={{ cursor: "default" }}
                        >
                        <p>Суммаризация</p>
                        </div>
                    ) : (
                        <div 
                        className={style.title__container}
                        onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={!isSummaryCollapsed}
                        title="Показать/скрыть суммаризацию"
                        >
                        <p>Суммаризация</p>
                        <CollapseIcon className={`${style.icon} ${isSummaryCollapsed ? style.collapsed : ''}`} />
                        </div>
                    )}
                    <button
                        className={style.btn__summorize}
                        onClick={handleSummarize}
                        disabled={summarizationStatus === 'loading' || summarizationStatus === 'success'}
                    >
                        {(summarizationStatus === 'idle' || summarizationStatus === 'error') && ("Начать")}
                        {(summarizationStatus === 'loading') && ("Загрузка")}
                        {(summarizationStatus === 'success') && ("Готово")}
                    </button>
                    </div>
                    <div
                      ref={summaryRef}
                      className={style.text__container}
                      style={{ transition: 'height 0.3s ease' }}
                    >
                      {(summarizationStatus !== 'idle' || file?.summarizedText) && (
                        <div className={style.transcribation__block}>
                            {summarizationStatus === 'loading' && (
                            <Loader />
                            )}
                            {summarizationStatus === 'success' && file?.summarizedText && (
                            <div className={style.text}>{file.summarizedText}</div>
                            )}
                            {summarizationStatus === 'error' && currentSummarizationError && (
                            <div className={style.text} style={{ color: 'red' }}>
                                {currentSummarizationError}
                            </div>
                            )}
                        </div>
                      )}
                    </div>
                </div>
            </div>
            <div className={style.chat}>
                {/* <AIChat 
                  segments={file.transcript}
                  onSegmentMatch={(segments) => {
                    if (!segments) {
                      setActiveSegments(null)
                      return
                    }
                    setActiveSegments(
                      segments.map((segment) => ({
                        segment,
                        key: Date.now() + Math.random(),
                      }))
                    );
                  }}
                /> */}
            </div>
        </div>
      </div>
    </Page>
  );
};
