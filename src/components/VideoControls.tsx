import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Scissors } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSplit: () => void;
}

export const VideoControls = ({
  isPlaying,
  onPlayPause,
  onReset,
  onSplit
}: VideoControlsProps) => {
  return (
    <div className="flex justify-center gap-4">
      <Button onClick={onPlayPause}>
        {isPlaying ? (
          <Pause className="w-4 h-4 mr-2" />
        ) : (
          <Play className="w-4 h-4 mr-2" />
        )}
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
      <Button variant="secondary" onClick={onReset}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
      <Button variant="secondary" onClick={onSplit}>
        <Scissors className="w-4 h-4 mr-2" />
        Split
      </Button>
    </div>
  );
};