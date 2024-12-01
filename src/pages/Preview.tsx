import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, FileVideo } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoUrl = location.state?.videoUrl;
  const mimeType = location.state?.mimeType;
  const [isConverting, setIsConverting] = useState(false);

  const handleDownload = () => {
    if (!videoUrl) return;

    fetch(videoUrl)
      .then(response => response.blob())
      .then(blob => {
        const fileExtension = mimeType?.includes('mp4') ? 'mp4' : 'webm';
        const url = window.URL.createObjectURL(
          new Blob([blob], { type: mimeType || 'video/mp4' })
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = `teleprompter-recording.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Log MIME type for debugging
        console.log('File MIME type:', mimeType);
      })
      .catch(error => {
        console.error("Error downloading video:", error);
      });
  };

  const convertToMP4 = async () => {
    if (!videoUrl) return;

    try {
      setIsConverting(true);
      toast({
        title: "Starting conversion",
        description: "Please wait while we convert your video to MP4...",
      });

      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
      });

      const inputData = await fetchFile(videoUrl);
      await ffmpeg.writeFile('input.webm', inputData);

      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-c:a', 'aac',
        'output.mp4'
      ]);

      const outputData = await ffmpeg.readFile('output.mp4');
      const outputBlob = new Blob([outputData], { type: 'video/mp4' });
      const outputUrl = URL.createObjectURL(outputBlob);

      const a = document.createElement('a');
      a.href = outputUrl;
      a.download = 'teleprompter-recording.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(outputUrl);

      toast({
        title: "Conversion complete",
        description: "Your video has been converted to MP4 format.",
      });
    } catch (error) {
      console.error('Error converting video:', error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Always show convert button for WebM videos
  const showConvertButton = true;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Preview Recording</h1>
        
        {videoUrl ? (
          <div className="space-y-6">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
            />
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download Original
              </Button>
              {showConvertButton && (
                <Button 
                  onClick={convertToMP4} 
                  disabled={isConverting}
                  variant="secondary"
                >
                  <FileVideo className="w-4 h-4 mr-2" />
                  {isConverting ? 'Converting...' : 'Convert to MP4'}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/")} className="text-gray-900">
                <RotateCcw className="w-4 h-4 mr-2" />
                Record Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>No recording found. Please go back and record first.</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;