import React from 'react';
import { VideoControls } from '../VideoControls';
import { VideoVolume } from '../VideoVolume';

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoUrl: string | undefined;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSplit: () => void;
  onTimeUpdate: () => void;
  onEnded: () => void;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
}

export const VideoPreview = ({
  videoRef,
  videoUrl,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  onPlayPause,
  onReset,
  onSplit,
  onTimeUpdate,
  onEnded,
  onVolumeChange,
  onMuteToggle,
}: VideoPreviewProps) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
        />
      </div>
      
      <div className="flex gap-4">
        <VideoControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onReset={onReset}
          onSplit={onSplit}
        />
        <VideoVolume
          volume={volume}
          onVolumeChange={onVolumeChange}
          onMuteToggle={onMuteToggle}
          isMuted={isMuted}
        />
      </div>
    </div>
  );
};