import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Trash2 } from 'lucide-react';
import { TimelineClip } from '@/types/editor';
import { toast } from '@/hooks/use-toast';

interface DraggableClipProps {
  clip: TimelineClip;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onPreviewClip: (startTime: number) => void;
  onDeleteClip: (clipId: string) => void;
  isDragging: boolean;
}

export const DraggableClip = ({
  clip,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onPreviewClip,
  onDeleteClip,
  isDragging,
}: DraggableClipProps) => {
  const handlePreviewClick = () => {
    onPreviewClip(clip.startTime);
  };

  const handleDeleteClick = () => {
    onDeleteClip(clip.id);
    toast({
      title: "Clip Deleted",
      description: `Clip ${index + 1} has been removed`,
    });
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`p-2 mb-2 bg-gray-700 rounded flex justify-between items-center cursor-move hover:bg-gray-600 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span>
        Clip {index + 1}: {clip.startTime.toFixed(2)}s - {clip.endTime.toFixed(2)}s
      </span>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handlePreviewClick}
        >
          <Play className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDeleteClick}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};