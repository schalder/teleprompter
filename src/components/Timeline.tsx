import { Slider } from '@/components/ui/slider';

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

export const Timeline = ({ currentTime, duration, onSeek }: TimelineProps) => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Timeline</h3>
      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 100}
        step={0.1}
        onValueChange={onSeek}
        className="mb-4"
      />
      <div className="text-sm text-gray-400">
        {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
      </div>
    </div>
  );
};