import { Slider } from '@/components/ui/slider';
import { useEffect, useState } from 'react';

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

export const Timeline = ({ currentTime, duration, onSeek }: TimelineProps) => {
  const [sliderValue, setSliderValue] = useState(currentTime);

  useEffect(() => {
    setSliderValue(currentTime);
  }, [currentTime]);

  const handleSeek = (value: number[]) => {
    setSliderValue(value[0]);
    onSeek(value);
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Timeline</h3>
      <Slider
        value={[sliderValue]}
        min={0}
        max={duration || 100}
        step={0.1}
        onValueChange={handleSeek}
        className="mb-4"
      />
      <div className="text-sm text-gray-400">
        {sliderValue.toFixed(2)}s / {duration.toFixed(2)}s
      </div>
    </div>
  );
};