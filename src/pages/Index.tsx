import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import TeleprompterControls from "@/components/TeleprompterControls";
import RecordingModal from "@/components/RecordingModal";

const Index = () => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [speed, setSpeed] = useState(50);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<"camera" | "screen" | "both">("both");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [previewStream]);

  useEffect(() => {
    // Start preview when recording type changes in modal
    if (isModalOpen) {
      startPreview();
    }
  }, [recordingType, isModalOpen]);

  const startPreview = async () => {
    try {
      // Stop any existing preview
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }

      let stream: MediaStream | null = null;

      if (recordingType === "camera" || recordingType === "both") {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } else if (recordingType === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      if (stream) {
        setPreviewStream(stream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start preview. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  };

  const startRecording = async () => {
    try {
      let finalStream: MediaStream;

      if (recordingType === "camera" || recordingType === "both") {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        if (recordingType === "both") {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const [screenTrack] = screenStream.getVideoTracks();
          const [cameraTrack] = mediaStream.getVideoTracks();
          const [audioTrack] = mediaStream.getAudioTracks();
          finalStream = new MediaStream([screenTrack, audioTrack]);
          
          // Create PiP video element for camera
          const pipVideo = document.createElement("video");
          pipVideo.srcObject = new MediaStream([cameraTrack]);
          pipVideo.classList.add("fixed", "bottom-4", "right-4", "rounded-full", "w-32", "h-32", "object-cover", "z-50");
          pipVideo.autoplay = true;
          document.body.appendChild(pipVideo);
        } else {
          finalStream = mediaStream;
        }
      } else {
        // Screen only
        finalStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      const mediaRecorder = new MediaRecorder(finalStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/mp4" });
        navigate("/preview", { state: { videoUrl: URL.createObjectURL(blob) } });
      };

      // Stop preview if it's running
      stopPreview();

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Remove PiP video if it exists
      const pipVideo = document.querySelector("video.fixed");
      if (pipVideo) {
        pipVideo.remove();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Teleprompter</h1>
        
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your script here..."
            className="h-40 bg-gray-800 border-gray-700"
          />
          
          <TeleprompterControls
            fontSize={fontSize}
            setFontSize={setFontSize}
            speed={speed}
            setSpeed={setSpeed}
          />

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="w-full"
            disabled={isRecording}
          >
            {isRecording ? "Recording in Progress..." : "Open Recording Options"}
          </Button>

          <RecordingModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              stopPreview();
            }}
            recordingType={recordingType}
            setRecordingType={setRecordingType}
            onStartRecording={() => {
              setIsModalOpen(false);
              startRecording();
            }}
            previewVideoRef={previewVideoRef}
            isPreviewActive={!!previewStream}
          />
        </div>

        <div 
          className="mt-8 p-6 bg-gray-800 rounded-lg overflow-y-auto max-h-[400px]"
          style={{
            fontSize: `${fontSize}px`,
            transition: "font-size 0.3s ease"
          }}
        >
          <div
            className="animate-scroll"
            style={{
              animation: text && isRecording ? `scroll ${100 - speed}s linear infinite` : "none"
            }}
          >
            {text || "Your text will appear here..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
