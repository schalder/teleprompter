import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import TeleprompterControls from "@/components/TeleprompterControls";
import RecordingModal from "@/components/RecordingModal";
import TeleprompterPreview from "@/components/TeleprompterPreview";
import RecordingControls from "@/components/RecordingControls";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

        // Create PiP video element for camera
        pipVideo = document.createElement("video");
        pipVideo.srcObject = new MediaStream([cameraStream.getVideoTracks()[0]]);
        pipVideo.autoplay = true;
        pipVideo.muted = true;
        pipVideo.setAttribute("id", "pip-video-overlay");
        
        // Create floating stop button
        stopButton = document.createElement("button");
        stopButton.setAttribute("id", "floating-stop-button");
        stopButton.textContent = "Stop Recording";
        
        // Enhanced styles for PiP video to ensure it stays on top across all windows
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

        // Enhanced styles for stop button to ensure visibility across windows
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

        // Apply styles
        Object.assign(pipVideo.style, pipStyles);
        Object.assign(stopButton.style, stopButtonStyles);
        
        // Add elements to document body
        document.body.appendChild(pipVideo);
        document.body.appendChild(stopButton);

        // Handle stop button click
        stopButton.onclick = () => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
        };

        // Create visibility change handler and store in ref
        handleVisibilityChangeRef.current = () => {
          if (document.visibilityState === "visible" && pipVideo) {
            pipVideo.play().catch(() => {});
          }
        };

        // Add event listener
        document.addEventListener("visibilitychange", handleVisibilityChangeRef.current);

        // Handle screen track ending
        screenTrack.addEventListener("ended", () => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
        });
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
        
        // Clean up PiP video and stop button
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
        
        navigate("/preview", { state: { videoUrl: URL.createObjectURL(blob) } });
      };

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
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Teleprompter</h1>
        
        {/* Teleprompter Preview moved to top */}
        <TeleprompterPreview
          text={text}
          fontSize={fontSize}
          speed={speed}
          isScrolling={isPreviewing || isRecording}
        />
        
        {/* Controls section */}
        <div className="space-y-6 bg-gray-800 p-6 rounded-lg">
          <TeleprompterControls
            fontSize={fontSize}
            setFontSize={setFontSize}
            speed={speed}
            setSpeed={setSpeed}
          />

          {recordingType === "camera" && (
            <div className="space-y-2">
              <Label className="text-lg font-medium">Camera Resolution</Label>
              <RadioGroup
                value={cameraResolution}
                onValueChange={(value: "landscape" | "portrait") => setCameraResolution(value)}
                className="flex space-x-4"
              >
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition-colors border border-gray-600"
                  onClick={() => setCameraResolution("landscape")}
                >
                  <RadioGroupItem value="landscape" id="landscape" className="cursor-pointer" />
                  <Label htmlFor="landscape" className="cursor-pointer hover:text-primary">1920x1080 (Landscape)</Label>
                </div>
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition-colors border border-gray-600"
                  onClick={() => setCameraResolution("portrait")}
                >
                  <RadioGroupItem value="portrait" id="portrait" className="cursor-pointer" />
                  <Label htmlFor="portrait" className="cursor-pointer hover:text-primary">1080x1920 (Portrait)</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-lg font-medium">Recording Type</Label>
            <div className="grid grid-cols-3 gap-4">
              {["camera", "screen", "both"].map((type) => (
                <button
                  key={type}
                  onClick={() => setRecordingType(type as "camera" | "screen" | "both")}
                  className={`p-4 rounded-lg border transition-all ${
                    recordingType === type
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

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

        {/* Text input moved to bottom */}
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
        />
      </div>
    </div>
  );
};

export default Index;