import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { TranscribationSegment } from '../interfaces/ITranscribation';

const getExpTextFromJson = (text: TranscribationSegment[]) => {
  let expText = '';

  text.forEach((segment) => {
    if (segment.speaker) {
      expText += `${segment.speaker}\n`;
    }
    expText += `${segment.start} - ${segment.end}\n`;
    expText += `${segment.text}\n\n`;
  });

  return expText;
};

export const exportToDocx = (text: TranscribationSegment[], title: string) => {
  const lines = getExpTextFromJson(text).split('\n');

  const doc = new Document({
    sections: [
      {
        children: lines.map(line =>
          new Paragraph({
            children: [new TextRun(line)],
          })
        ),
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${title}.docx`);
  });
};
