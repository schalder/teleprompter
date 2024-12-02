import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface LayerTrackProps {
  name: string;
  type: 'video' | 'audio';
  duration: number;
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: () => void;
}

export const LayerTrack = ({
  name,
  type,
  duration,
  volume = 1,
  isMuted = false,
  onVolumeChange,
  onMuteToggle
}: LayerTrackProps) => {
  return (
    <div className="flex items-center gap-4 p-2 bg-gray-800 rounded-lg mb-2">
      <span className="text-sm font-medium w-24">{name}</span>
      {type === 'audio' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMuteToggle}
            className="w-8 h-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={(values) => onVolumeChange?.(values[0])}
            className="w-32"
          />
        </>
      )}
      <div 
        className="flex-1 h-8 bg-gray-700 rounded"
        style={{ width: `${duration * 10}px` }}
      />
    </div>
  );
};