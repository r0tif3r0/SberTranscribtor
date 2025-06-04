import axios from 'axios';
import { TranscribationSegment } from '../interfaces/ITranscribation';

const BASE_URL = 'http://localhost:8000';

/**
 * Отправляет один файл на сервер для транскрипции.
 * @param file — аудиофайл из input или dropzone
 * @param diarize — нужно ли разделение по спикерам
 * @param grammar — нужна ли грамматика
 * @returns Promise с массивом сегментов { speaker, start, end, text }
 */
export const transcribeFile = async (
  file: File,
  diarize: boolean,
  grammar: boolean,
): Promise<Array<TranscribationSegment>> => {
    
  const formData = new FormData();
  formData.append('file', file, file.name);

  const params = { diarize, grammar };

  try {
    const response = await axios.post('/transcribe', formData, {
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params,
    });
    return response.data.transcript;
  } catch (err: any) {
    if (err.response) {
      console.error('Ошибка сервера при транскрибации:', err.response.status, err.response.data);
      throw new Error(err.response.data.detail || 'Server Error');
    } else {
      console.error('Сетевой или клиентский сбой при транскрибации:', err.message);
      throw new Error(err.message);
    }
  }
};

/**
 * Отправляет массив сегментов транскрипции на сервер для суммаризации.
 * @param segments — массив объектов TranscriptSegment для суммаризации.
 * @returns Promise с суммаризированным текстом.
 */
export const summarizeText = async (segments: TranscribationSegment[]): Promise<string> => {
  try {
    const response = await axios.post('/summarize', segments, {
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error('Ошибка сервера при суммаризации:', err.response.status, err.response.data);
      throw new Error(err.response.data.detail || 'Server Error during summarization');
    } else {
      console.error('Сетевой или клиентский сбой при суммаризации:', err.message);
      throw new Error(err.message);
    }
  }
};

/**
 * Отправляет массив сегментов транскрипции на сервер для проверки ФЗ-230.
 * @param segments — массив объектов TranscriptSegment для суммаризации.
 * @returns Promise с текстом результата проверки.
 */
export const check230FZ = async (segments: TranscribationSegment[]): Promise<string> => {
  try {
    const response = await axios.post('/check-230fz', segments, {
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error('Ошибка сервера при проверке ФЗ-230:', err.response.status, err.response.data);
      throw new Error(err.response.data.detail || 'Server Error during summarization');
    } else {
      console.error('Сетевой или клиентский сбой при проверке ФЗ-230:', err.message);
      throw new Error(err.message);
    }
  }
};

/**
 * Загружает сегменты разговора в RAG-сессию.
 * @param sessionId — уникальный идентификатор сессии.
 * @param segments — массив транскрибированных сегментов.
 */
export const loadChatContext = async (
  sessionId: string,
  segments: TranscribationSegment[]
): Promise<void> => {
  try {
    await axios.post(
      '/chat/load',
      { session_id: sessionId, data: segments },
      {
        baseURL: BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    if (err.response) {
      console.error('Ошибка при загрузке контекста:', err.response.status, err.response.data);
      throw new Error(err.response.data.detail || 'Server Error during context loading');
    } else {
      console.error('Сетевой сбой при загрузке контекста:', err.message);
      throw new Error(err.message);
    }
  }
};

/**
 * Отправляет вопрос к загруженной сессии.
 * @param sessionId — ID активной сессии.
 * @param question — текст вопроса.
 * @returns Ответ от RAG-движка.
 */
export const askChatQuestion = async (
  sessionId: string,
  question: string
): Promise<string> => {
  try {
    const response = await axios.post(
      '/chat/ask',
      { session_id: sessionId, question: question },
      {
        baseURL: BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.answer;
  } catch (err: any) {
    if (err.response) {
      console.error('Ошибка при запросе чата:', err.response.status, err.response.data);
      throw new Error(err.response.data.detail || 'Server Error during chat');
    } else {
      console.error('Сетевой сбой при запросе чата:', err.message);
      throw new Error(err.message);
    }
  }
};

/**
 * Отправляет один PDF-файл на сервер для загрузки и извлечения страниц.
 * @param file — PDF-файл из input или dropzone
 * @returns Promise с массивом страниц { page: number, content: string }
 */
export const loadDocument = async (
  file: File,
  sessionId: string,
): Promise<Array<{ page: number; content: string }>> => {

  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('session_id', sessionId);

  try {
    const response = await axios.post('/load_docs', formData, {
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error('Ошибка сервера при загрузке PDF:', err.response.status, err.response.data);
      throw new Error(err.response.data.detail || 'Server Error');
    } else {
      console.error('Сетевой или клиентский сбой при загрузке PDF:', err.message);
      throw new Error(err.message);
    }
  }
};