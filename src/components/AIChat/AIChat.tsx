import React, { useState, useRef, useEffect } from 'react';
import style from './AIChat.module.scss';
import { useParams } from 'react-router-dom';
import { formatReadableTime } from '../../utils/Format';
import { askChatQuestion, loadChatContext } from '../../api/axios.api';
import { TranscribationSegment } from '../../interfaces/ITranscribation';
import { Loader } from '../loader/Loader';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

interface AIChatProps {
  segments: TranscribationSegment[];
  onSegmentMatch?: (segments: TranscribationSegment[] | null) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ segments, onSegmentMatch }) => {
  const { id: sessionId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const normalizedSegments = segments.map(segment => ({
    ...segment,
    speaker: segment.speaker === undefined ? null : segment.speaker,
  }));
  

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Загрузка контекста при первом рендеринге
  useEffect(() => {
    const initChat = async () => {
      if (!sessionId || !normalizedSegments.length) return;

      try {
        await loadChatContext(sessionId, normalizedSegments);
        setIsInitialized(true);
      } catch (e) {
        console.error('Не удалось загрузить контекст:', e);
        setIsInitialized(false);
      }
    };

    initChat();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: formatReadableTime(new Date().toLocaleTimeString()),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const typingMessageId = Date.now() + 1;
    const typingMessage: Message = {
      id: typingMessageId,
      text: '...',
      sender: 'bot',
      timestamp: '',
    };
    setMessages((prev) => [...prev, typingMessage]);
    onSegmentMatch?.(null);
    try {
      const response = await askChatQuestion(sessionId || '', userMessage.text);

      const matches = [...response.matchAll(/\[(\d{2}:\d{2}:\d{2})\s*–\s*(\d{2}:\d{2}:\d{2})\]/g)];
      if (matches.length > 0) {

        const matchedSegments = segments.filter((segment) =>
          matches.some(([_, startTime, endTime]) =>
            segment.start === startTime && segment.end === endTime
          )
        );

        if (matchedSegments.length > 0) {
          onSegmentMatch?.(matchedSegments);
        }
      }

      const botMessage: Message = {
        id: Date.now() + 2,
        text: response,
        sender: 'bot',
        timestamp: formatReadableTime(new Date().toLocaleTimeString()),
      };
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== typingMessageId),
        botMessage,
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Ошибка при получении ответа от сервера.',
          sender: 'bot',
          timestamp: formatReadableTime(new Date().toLocaleTimeString()),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    autoResizeTextarea(e.target);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    const maxLines = 6;
    const lineHeight = 24;
    const maxHeight = lineHeight * maxLines;

    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [inputValue]);

  return (
    <div className={style.chat__container}>
      <div className={style.chat__header}>
        <h2>AI Чат</h2>
      </div>
      <div className={style.chat_messages}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${style.message} ${style[msg.sender]}`}>
            <div className={style.message_content}>
              <span className={style.message_text}>
                {msg.text === '...' ? (
                  <span className={style.typing_indicator}>
                    <span></span><span></span><span></span>
                  </span>
                ) : (
                  msg.text
                )}
              </span>
              <span className={style.message_timestamp}>{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {(!isInitialized) && (
        <div className={style.initial_info}>
          <Loader/>
          <p>Загружаем контекст в чат</p>
        </div>
        )}
        <div className={style.msg_ref_end} ref={messagesEndRef} />
      </div>
      <div className={style.chat_input_area}>
        <textarea
          ref={textareaRef}
          className={style.chat_input}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={isInitialized ? "Напишите сообщение..." : "Инициализация..."}
          disabled={!isInitialized || isLoading}
        />
        <button className={style.chat_send_button} onClick={handleSendMessage} disabled={!isInitialized || isLoading}>
          Отправить
        </button>
      </div>
    </div>
  );
};
