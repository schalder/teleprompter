import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ArrowLeft, Play, Pause, RotateCcw, Scissors, Plus } from 'lucide-react';

interface TimelineClip {
  id: string;
  startTime: number;
  endTime: number;
}

const VideoEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState<TimelineClip[]>([]);

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

      if (affectedClipIndex === -1) return prevClips;

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

      return newClips;
    });
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
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
              {/* Preview Section */}
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
                
                <div className="flex justify-center gap-4">
                  <Button onClick={togglePlayPause}>
                    {isPlaying ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button variant="secondary" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="secondary" onClick={handleSplitAtCurrentTime}>
                    <Scissors className="w-4 h-4 mr-2" />
                    Split
                  </Button>
                </div>
              </div>

              {/* Controls Section */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Editor Controls</h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-700 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Timeline</h3>
                    <Slider
                      value={[currentTime]}
                      min={0}
                      max={duration}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="mb-4"
                    />
                    <div className="text-sm text-gray-400">
                      {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                    </div>
                  </div>
                  
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