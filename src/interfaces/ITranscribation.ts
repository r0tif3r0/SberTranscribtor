export interface TranscribationSegment {
  speaker?: string | null;
  start: string;
  end: string;
  text: string;
}