import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Play } from 'lucide-react';
import { TimelineClip } from '@/types/editor';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface ClipsListProps {
  clips: TimelineClip[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onPreviewClip: (startTime: number) => void;
}

export const ClipsList = ({ clips, onReorder, onPreviewClip }: ClipsListProps) => {
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

  const handlePreviewClick = (startTime: number) => {
    onPreviewClip(startTime);
    toast({
      title: "Preview started",
      description: `Jumping to ${startTime.toFixed(2)} seconds`,
    });
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Clips</h3>
      <ScrollArea className="h-[200px]">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`p-2 mb-2 bg-gray-700 rounded flex justify-between items-center cursor-move hover:bg-gray-600 transition-colors ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <span>
              Clip {index + 1}: {clip.startTime.toFixed(2)}s - {clip.endTime.toFixed(2)}s
            </span>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handlePreviewClick(clip.startTime)}
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};