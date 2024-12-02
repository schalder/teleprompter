import { Button } from '@/components/ui/button';
import { Download, Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportOptionsProps {
  onExport: (format: string, quality: string) => void;
}

export const ExportOptions = ({ onExport }: ExportOptionsProps) => {
  const handleExport = (format: string) => {
    onExport(format, 'high');
    // You would implement actual export logic here
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
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};