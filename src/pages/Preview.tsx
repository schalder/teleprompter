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
                Download Recording
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => window.open('https://cloudconvert.com/webm-to-mp4', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Convert to MP4 (External)
              </Button>

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