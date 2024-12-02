import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { VideoControls } from '@/components/VideoControls';
import { Timeline } from '@/components/Timeline';
import { ClipsList } from '@/components/ClipsList';
import { TimelineClip } from '@/types/editor';
import { useToast } from '@/components/ui/use-toast';

const VideoEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!videoUrl) {
      navigate('/');
    }
  }, [videoUrl, navigate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setClips([{
        id: '1',
        startTime: 0,
        endTime: video.duration
      }]);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSplitAtCurrentTime = () => {
    if (!videoRef.current) return;

    const splitTime = videoRef.current.currentTime;
    setClips(prevClips => {
      const affectedClipIndex = prevClips.findIndex(
        clip => splitTime > clip.startTime && splitTime < clip.endTime
      );

      if (affectedClipIndex === -1) {
        toast({
          title: "Cannot split here",
          description: "Please select a valid position within a clip to split.",
          variant: "destructive",
        });
        return prevClips;
      }

      const affectedClip = prevClips[affectedClipIndex];
      const newClips = [...prevClips];
      
      newClips.splice(affectedClipIndex, 1, 
        {
          id: `${affectedClip.id}-1`,
          startTime: affectedClip.startTime,
          endTime: splitTime
        },
        {
          id: `${affectedClip.id}-2`,
          startTime: splitTime,
          endTime: affectedClip.endTime
        }
      );

      toast({
        title: "Clip split successfully",
        description: `Split at ${splitTime.toFixed(2)} seconds`,
      });

      return newClips;
    });
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && typeof value[0] === 'number' && isFinite(value[0])) {
      const newTime = Math.max(0, Math.min(value[0], duration));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ResizablePanelGroup direction="vertical" className="min-h-screen">
        <ResizablePanel defaultSize={60}>
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Video Editor</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
                
                <VideoControls
                  isPlaying={isPlaying}
                  onPlayPause={togglePlayPause}
                  onReset={handleReset}
                  onSplit={handleSplitAtCurrentTime}
                />
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Editor Controls</h2>
                <div className="space-y-4">
                  <Timeline
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                  />
                  
                  <ClipsList clips={clips} />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={40}>
          <div className="p-4 bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="border border-gray-700 rounded-lg p-4 h-full">
              <div className="flex items-center justify-center h-full text-gray-400">
                Advanced timeline visualization coming soon...
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default VideoEditor;