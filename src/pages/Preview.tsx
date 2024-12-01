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
        description: "Converting video to MP4 (typically under 30 seconds)...",
      });

      const ffmpeg = new FFmpeg();
      console.log("FFmpeg instance created");

      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
      });
      console.log("FFmpeg loaded");

      const inputData = await fetchFile(videoUrl);
      console.log("Input file fetched");
      
      await ffmpeg.writeFile('input.webm', inputData);
      console.log("Input file written");

      // Super aggressive optimization settings
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-profile:v', 'baseline',
        '-level', '3.0',
        '-crf', '35',
        '-maxrate', '1M',
        '-bufsize', '2M',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '64k',
        '-ac', '1',
        '-ar', '44100',
        '-f', 'mp4',
        '-movflags', '+faststart',
        'output.mp4'
      ]);
      console.log("Conversion command executed");

      const outputData = await ffmpeg.readFile('output.mp4');
      console.log("Output file read");

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
        description: "Your video has been converted and downloaded as MP4.",
      });
    } catch (error) {
      console.error('Error converting video:', error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your video. Please try with reduced quality settings.",
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