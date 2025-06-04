import { TranscribationSegment } from "./ITranscribation";

export interface UploadedAudioFile {
    id: string;
    name: string;
    duration: number;
    diarize: boolean;
    uploadTime: string;
    status: 'loading' | 'success' | 'error';
    transcript: TranscribationSegment[];
    summarizedText?: string | null;
    checkouts?: any;
}