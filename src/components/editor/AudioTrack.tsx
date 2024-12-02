import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Layer } from '@/types/editor';

interface AudioTrackProps {
  layer: Layer;
  onVolumeChange: (layerId: string, volume: number) => void;
  onMuteToggle: (layerId: string) => void;
}

export const AudioTrack = ({ layer, onVolumeChange, onMuteToggle }: AudioTrackProps) => {
  return (
    <div className="flex items-center gap-4 p-2 bg-gray-800 rounded-lg">
      <span className="text-sm font-medium">{layer.name}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onMuteToggle(layer.id)}
        className="w-8 h-8 p-0"
      >
        {layer.muted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      <Slider
        value={[layer.volume || 0]}
        min={0}
        max={1}
        step={0.1}
        onValueChange={(value) => onVolumeChange(layer.id, value[0])}
        className="w-32"
      />
    </div>
  );
};