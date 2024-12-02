import React from 'react';
import { Slider } from '@/components/ui/slider';

interface TimelineTrackProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  selectionStart?: number;
  selectionEnd?: number;
  onSelectionChange?: (start: number, end: number) => void;
}

export const TimelineTrack = ({
  currentTime,
  duration,
  onSeek,
  selectionStart,
  selectionEnd,
  onSelectionChange
}: TimelineTrackProps) => {
  if (!isFinite(duration) || duration <= 0) {
    return null;
  }

  return (
    <div className="relative p-4 border border-gray-700 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400 w-20">
          {isFinite(currentTime) ? currentTime.toFixed(1) : '0.0'}s / {duration.toFixed(1)}s
        </span>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={(values) => {
            const newTime = values[0];
            if (isFinite(newTime) && newTime >= 0 && newTime <= duration) {
              onSeek(newTime);
            }
          }}
          className="w-full"
        />
      </div>
      {selectionStart !== undefined && selectionEnd !== undefined && (
        <div 
          className="absolute bottom-0 left-0 h-2 bg-blue-500 opacity-50"
          style={{
            left: `${(selectionStart / duration) * 100}%`,
            width: `${((selectionEnd - selectionStart) / duration) * 100}%`
          }}
        />
      )}
    </div>
  );
};