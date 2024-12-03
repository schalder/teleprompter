import { Button } from '@/components/ui/button';
import { Download, Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import webmToMp4 from 'webm-to-mp4';

interface ExportOptionsProps {
  onExport: (format: string, quality: string) => void;
  videoUrl?: string;
}

export const ExportOptions = ({ onExport, videoUrl }: ExportOptionsProps) => {
  const handleExport = async (format: string) => {
    try {
      if (format === 'mp4' && videoUrl) {
        // Convert WebM to MP4
        const webmBlob = await fetch(videoUrl).then(r => r.blob());
        const arrayBuffer = await webmBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const mp4ArrayBuffer = await webmToMp4(uint8Array);
        const mp4Blob = new Blob([mp4ArrayBuffer], { type: 'video/mp4' });
        
        // Create download link
        const url = URL.createObjectURL(mp4Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        onExport(format, 'high');
      }
      
      toast({
        title: "Export Started",
        description: `Exporting video as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Export</h3>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mp4">MP4</SelectItem>
              <SelectItem value="webm">WebM</SelectItem>
              <SelectItem value="gif">GIF</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="high">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('mp4')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};