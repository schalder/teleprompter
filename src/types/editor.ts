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