import { Timeline } from '../Timeline';
import { ClipsList } from '../ClipsList';
import { TimelineClip } from '@/types/editor';

interface TimelineSectionProps {
  currentTime: number;
  duration: number;
  clips: TimelineClip[];
  onSeek: (value: number[]) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onPreviewClip: (startTime: number) => void;
}

export const TimelineSection = ({
  currentTime,
  duration,
  clips,
  onSeek,
  onReorder,
  onPreviewClip,
}: TimelineSectionProps) => {
  return (
    <div className="p-4 bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Timeline</h2>
      <div className="space-y-4">
        <Timeline
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
        <ClipsList
          clips={clips}
          onReorder={onReorder}
          onPreviewClip={onPreviewClip}
        />
      </div>
    </div>
  );
};