import { Volume, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface VideoVolumeProps {
  volume: number;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

export const VideoVolume = ({ volume, onVolumeChange, onMuteToggle, isMuted }: VideoVolumeProps) => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onMuteToggle}>
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume className="w-4 h-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={onVolumeChange}
          className="w-32"
        />
        <span className="text-sm text-gray-400">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};