import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import TeleprompterControls from "@/components/TeleprompterControls";
import RecordingModal from "@/components/RecordingModal";
import TeleprompterPreview from "@/components/TeleprompterPreview";
import RecordingControls from "@/components/RecordingControls";

const Index = () => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [speed, setSpeed] = useState(50);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
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
    setIsPreviewing(false);
    try {
      let finalStream: MediaStream;
      let pipVideo: HTMLVideoElement | null = null;

      if (recordingType === "camera") {
        finalStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
      } else if (recordingType === "screen") {
        finalStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true
        });
      } else if (recordingType === "both") {
        // Get both camera and screen streams
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true 
        });

        // Create a composite stream with screen video and camera audio
        const [screenTrack] = screenStream.getVideoTracks();
        const [audioTrack] = cameraStream.getAudioTracks();
        finalStream = new MediaStream([screenTrack, audioTrack]);

        // Create and style PiP video element for camera
        pipVideo = document.createElement("video");
        pipVideo.srcObject = new MediaStream([cameraStream.getVideoTracks()[0]]);
        pipVideo.autoplay = true;
        pipVideo.style.position = "fixed";
        pipVideo.style.bottom = "20px";
        pipVideo.style.right = "20px";
        pipVideo.style.width = "180px";
        pipVideo.style.height = "180px";
        pipVideo.style.borderRadius = "50%";
        pipVideo.style.objectFit = "cover";
        pipVideo.style.zIndex = "9999";
        pipVideo.style.border = "3px solid white";
        pipVideo.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";
        document.body.appendChild(pipVideo);
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
        // Remove PiP video if it exists
        const existingPipVideo = document.querySelector("video.fixed");
        if (existingPipVideo) {
          existingPipVideo.remove();
        }
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

  const togglePreview = () => {
    setIsPreviewing(!isPreviewing);
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

          <RecordingControls
            isRecording={isRecording}
            recordingType={recordingType}
            setRecordingType={setRecordingType}
            onStartRecording={() => setIsModalOpen(true)}
            onStopRecording={stopRecording}
            isPreviewing={isPreviewing}
            onTogglePreview={togglePreview}
          />

          <TeleprompterPreview
            text={text}
            fontSize={fontSize}
            speed={speed}
            isScrolling={isPreviewing || isRecording}
          />

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
      </div>
    </div>
  );
};

export default Index;