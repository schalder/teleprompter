import React from 'react';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoSplitControlsProps {
  onSplit: () => void;
  currentTime: number;
}

export const VideoSplitControls = ({ onSplit, currentTime }: VideoSplitControlsProps) => {
  const handleSplit = () => {
    onSplit();
    toast({
      title: "Video Split",
      description: `Split created at ${currentTime.toFixed(2)} seconds`,
    });
  };

  return (
    <Button onClick={handleSplit} variant="secondary">
      <Scissors className="w-4 h-4 mr-2" />
      Split at {currentTime.toFixed(2)}s
    </Button>
  );
};