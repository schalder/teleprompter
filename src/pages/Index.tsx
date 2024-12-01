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
  const [cameraResolution, setCameraResolution] = useState<"landscape" | "portrait">("landscape");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const handleVisibilityChangeRef = useRef<(() => void) | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [previewStream]);

  useEffect(() => {
    if (isModalOpen) {
      startPreview();
    }
  }, [recordingType, isModalOpen]);

  const startPreview = async () => {
    try {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }

      let stream: MediaStream | null = null;

      if (recordingType === "camera" || recordingType === "both") {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: cameraResolution === "landscape" ? 1920 : 1080,
            height: cameraResolution === "landscape" ? 1080 : 1920,
            facingMode: "user"
          }, 
          audio: true 
        });
      } else if (recordingType === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      if (stream) {
        setPreviewStream(stream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
          // Add CSS transform to mirror the video preview
          previewVideoRef.current.style.transform = "scaleX(-1)";
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
      let stopButton: HTMLButtonElement | null = null;

      if (recordingType === "camera") {
        const constraints = {
          video: {
            width: cameraResolution === "landscape" ? 1920 : 1080,
            height: cameraResolution === "landscape" ? 1080 : 1920,
          },
          audio: true
        };
        finalStream = await navigator.mediaDevices.getUserMedia(constraints);
      } else if (recordingType === "screen") {
        finalStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor'
          },
          audio: true
        });
      } else if (recordingType === "both") {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: cameraResolution === "landscape" ? 1920 : 1080,
            height: cameraResolution === "landscape" ? 1080 : 1920,
          },
          audio: true
        });
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        const [screenTrack] = screenStream.getVideoTracks();
        const [audioTrack] = cameraStream.getAudioTracks();
        finalStream = new MediaStream([screenTrack, audioTrack]);

        pipVideo = document.createElement("video");
        pipVideo.srcObject = new MediaStream([cameraStream.getVideoTracks()[0]]);
        pipVideo.autoplay = true;
        pipVideo.muted = true;
        pipVideo.setAttribute("id", "pip-video-overlay");
        
        stopButton = document.createElement("button");
        stopButton.setAttribute("id", "floating-stop-button");
        stopButton.textContent = "Stop Recording";
        
        const pipStyles = {
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          objectFit: "cover",
          zIndex: "2147483647",
          border: "3px solid white",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          backgroundColor: "black",
          transform: "translate3d(0,0,0)",
          willChange: "transform",
          pointerEvents: "none",
          isolation: "isolate"
        };

        const stopButtonStyles = {
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          zIndex: "2147483647",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          transform: "translate3d(0,0,0)",
          willChange: "transform",
          isolation: "isolate"
        };

        Object.assign(pipVideo.style, pipStyles);
        Object.assign(stopButton.style, stopButtonStyles);
        
        document.body.appendChild(pipVideo);
        document.body.appendChild(stopButton);

        stopButton.onclick = () => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
        };

        handleVisibilityChangeRef.current = () => {
          if (document.visibilityState === "visible" && pipVideo) {
            pipVideo.play().catch(() => {});
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChangeRef.current);

        screenTrack.addEventListener("ended", () => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
        });
      }

      const options = {
        mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      };
      
      // Fallback if MP4 is not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=h264,opus';
        toast({
          title: "Notice",
          description: "MP4 recording not supported by your browser. Falling back to WebM format.",
        });
      }
      
      const mediaRecorder = new MediaRecorder(finalStream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'video/mp4' 
        });
        
        const pipVideo = document.getElementById("pip-video-overlay");
        const stopButton = document.getElementById("floating-stop-button");
        
        if (pipVideo) {
          pipVideo.remove();
        }
        if (stopButton) {
          stopButton.remove();
        }

        if (handleVisibilityChangeRef.current) {
          document.removeEventListener("visibilitychange", handleVisibilityChangeRef.current);
          handleVisibilityChangeRef.current = null;
        }
        
        navigate("/preview", { state: { videoUrl: URL.createObjectURL(blob), mimeType: mediaRecorder.mimeType } });
      };

      stopPreview();
      mediaRecorder.start(1000); // Capture chunks every second
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
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Teleprompter</h1>
        
        <TeleprompterPreview
          text={text}
          fontSize={fontSize}
          speed={speed}
          isScrolling={isPreviewing || isRecording}
        />
        
        <div className="space-y-6 bg-gray-800 p-6 rounded-lg">
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
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your script here..."
          className="h-40 bg-gray-800 border-gray-700"
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
          cameraResolution={cameraResolution}
          setCameraResolution={setCameraResolution}
        />
      </div>
    </div>
  );
};

export default Index;
