import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;

  const handleDownload = () => {
    if (!videoUrl) return;

    fetch(videoUrl)
      .then(response => response.blob())
      .then(blob => {
        // Create a new blob with proper MP4 MIME type
        const mp4Blob = new Blob([blob], { 
          type: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
        });
        const url = window.URL.createObjectURL(mp4Blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "teleprompter-recording.mp4";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
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
            
            <div className="flex space-x-4 justify-center">
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download MP4
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