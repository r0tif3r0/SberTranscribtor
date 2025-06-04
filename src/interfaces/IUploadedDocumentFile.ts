import { PDFPage } from "./IPDFPage";


export interface UploadedDocumentFile {
    id: string;
    name: string;
    size: number;
    uploadTime: string;
    status: 'loading' | 'success' | 'error';
    text: PDFPage[];
    summarizedText?: string | null;
    checkouts?: any;
}