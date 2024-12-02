export interface TimelineClip {
  id: string;
  name?: string;  // Make name optional
  startTime: number;
  endTime: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  type: 'video' | 'audio';
  clips: TimelineClip[];
  volume?: number;
  muted?: boolean;
}

export interface VideoEffect {
  type: 'filter' | 'brightness' | 'contrast';
  value: number;
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'high' | 'medium' | 'low';
}