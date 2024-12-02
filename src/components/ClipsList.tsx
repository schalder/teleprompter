import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { TimelineClip } from '@/types/editor';

interface ClipsListProps {
  clips: TimelineClip[];
}

export const ClipsList = ({ clips }: ClipsListProps) => {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Clips</h3>
      <ScrollArea className="h-[200px]">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className="p-2 mb-2 bg-gray-700 rounded flex justify-between items-center"
          >
            <span>
              Clip {index + 1}: {clip.startTime.toFixed(2)}s - {clip.endTime.toFixed(2)}s
            </span>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};