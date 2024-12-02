import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoExportProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  trimStart: number;
  trimEnd: number;
}

export const VideoExport = ({ videoRef, trimStart, trimEnd }: VideoExportProps) => {
  const handleExport = async () => {
    if (!videoRef.current) return;

    toast({
      title: "Starting Export",
      description: "Preparing your edited video...",
    });

    try {
      const stream = videoRef.current.captureStream?.() || 
                    videoRef.current.mozCaptureStream?.();
                    
      if (!stream) {
        throw new Error('Video capture not supported in this browser');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=h264'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'edited-video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Complete",
          description: "Your video has been exported successfully!",
        });
      };

      videoRef.current.currentTime = trimStart;
      mediaRecorder.start();

      videoRef.current.addEventListener('timeupdate', function handler() {
        if (videoRef.current?.currentTime >= trimEnd) {
          mediaRecorder.stop();
          videoRef.current.removeEventListener('timeupdate', handler);
        }
      });

      videoRef.current.play();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error exporting your video.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleExport} className="w-full">
      <Download className="w-4 h-4 mr-2" />
      Export Video
    </Button>
  );
};