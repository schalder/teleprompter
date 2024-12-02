import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scissors, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoSplitControlsProps {
  onSplit: () => void;
  currentTime: number;
  duration: number;
  onDeleteRange: (start: number, end: number) => void;
}

export const VideoSplitControls = ({ 
  onSplit, 
  currentTime, 
  duration,
  onDeleteRange 
}: VideoSplitControlsProps) => {
  const [rangeStart, setRangeStart] = useState<number | null>(null);

  const handleSplit = () => {
    if (currentTime <= 0 || currentTime >= duration) {
      toast({
        title: "Invalid Split Point",
        description: "Cannot split at the beginning or end of the video",
        variant: "destructive"
      });
      return;
    }

    onSplit();
    toast({
      title: "Video Split",
      description: `Split created at ${currentTime.toFixed(2)} seconds`,
    });
  };

  const handleSetRangeStart = () => {
    setRangeStart(currentTime);
    toast({
      title: "Range Start Set",
      description: `Range start set at ${currentTime.toFixed(2)} seconds`,
    });
  };

  const handleDeleteRange = () => {
    if (rangeStart === null) {
      toast({
        title: "Error",
        description: "Please set a range start point first",
        variant: "destructive"
      });
      return;
    }

    onDeleteRange(rangeStart, currentTime);
    setRangeStart(null);
    toast({
      title: "Range Deleted",
      description: `Deleted range from ${rangeStart.toFixed(2)}s to ${currentTime.toFixed(2)}s`,
    });
  };

  return (
    <div className="space-x-2">
      <Button onClick={handleSplit} variant="secondary">
        <Scissors className="w-4 h-4 mr-2" />
        Split at {currentTime.toFixed(2)}s
      </Button>
      
      <Button 
        onClick={handleSetRangeStart} 
        variant="outline"
        className={rangeStart !== null ? "bg-primary/20" : ""}
      >
        Set Range Start
      </Button>
      
      <Button 
        onClick={handleDeleteRange}
        variant="destructive"
        disabled={rangeStart === null}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Range
      </Button>
    </div>
  );
};