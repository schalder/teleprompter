import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoUrl = location.state?.videoUrl;
  const mimeType = location.state?.mimeType;

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

        console.log('File MIME type:', mimeType);
      })
      .catch(error => {
        console.error("Error downloading video:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Preview Recording</h1>
        
        {videoUrl ? (
          <div className="space-y-6">
            <div className="relative w-full rounded-lg overflow-hidden bg-gray-800">
              <video
                src={videoUrl}
                controls
                className="w-full h-auto"
                playsInline
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleDownload}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Recording
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => window.open('https://cloudconvert.com/webm-to-mp4', '_blank')}
                className="w-full sm:w-auto"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Convert to MP4 (External)
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="w-full sm:w-auto text-white hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Record Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="mb-4">No recording found. Please go back and record first.</p>
            <Button onClick={() => navigate("/")}>
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;