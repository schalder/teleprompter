import { ScrollArea } from '@/components/ui/scroll-area';
import { TimelineClip } from '@/types/editor';
import { useState } from 'react';
import { DraggableClip } from './editor/DraggableClip';

interface ClipsListProps {
  clips: TimelineClip[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onPreviewClip: (startTime: number) => void;
  onDeleteClip: (clipId: string) => void;
}

export const ClipsList = ({ 
  clips, 
  onReorder, 
  onPreviewClip,
  onDeleteClip 
}: ClipsListProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    onReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Clips</h3>
      <ScrollArea className="h-[200px]">
        {clips.map((clip, index) => (
          <DraggableClip
            key={clip.id}
            clip={clip}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onPreviewClip={onPreviewClip}
            onDeleteClip={onDeleteClip}
            isDragging={draggedIndex === index}
          />
        ))}
      </ScrollArea>
    </div>
  );
};