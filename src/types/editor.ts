export interface TimelineClip {
  id: string;
  startTime: number;
  endTime: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export interface VideoEffect {
  type: 'filter' | 'brightness' | 'contrast';
  value: number;
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'high' | 'medium' | 'low';
}