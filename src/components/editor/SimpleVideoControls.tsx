import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Music, Scissors, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SimpleVideoControlsProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onTrimStart: () => void;
  onTrimEnd: () => void;
  onAddAudio: (file: File) => void;
}

export const SimpleVideoControls = ({
  duration,
  currentTime,
  onSeek,
  onTrimStart,
  onTrimEnd,
  onAddAudio
}: SimpleVideoControlsProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      onAddAudio(file);
      toast({
        title: "Audio Added",
        description: `Added ${file.name} as background music`,
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (isFinite(newTime) && newTime >= 0 && newTime <= duration) {
      onSeek(newTime);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-700 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          {Math.floor(currentTime)}s / {Math.floor(duration)}s
        </span>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
      </div>

      <div className="flex gap-4">
        <Button onClick={onTrimStart} variant="secondary">
          <Scissors className="w-4 h-4 mr-2" />
          Trim Start
        </Button>
        <Button onClick={onTrimEnd} variant="secondary">
          <Scissors className="w-4 h-4 mr-2" />
          Trim End
        </Button>
        <div className="relative">
          <Input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
            id="audio-upload"
          />
          <Button asChild variant="secondary">
            <label htmlFor="audio-upload" className="cursor-pointer">
              <Music className="w-4 h-4 mr-2" />
              Add Music
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
};