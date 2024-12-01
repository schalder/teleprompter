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
  const [speed, setSpeed] = useState(8);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingType, setRecordingType] = useState<"camera" | "screen">("camera");
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

      if (recordingType === "camera") {
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePreview = () => {
    scrollToTop();
    setIsPreviewing(!isPreviewing);
  };

  const startRecording = async () => {
    scrollToTop();
    try {
      let finalStream: MediaStream;

      const getVideoConstraints = (isPortrait: boolean) => ({
        width: { ideal: isPortrait ? 1080 : 1920 },
        height: { ideal: isPortrait ? 1920 : 1080 },
        frameRate: { ideal: 30 }
      });

      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
        channelCount: 2
      };

      const isPortraitMode = cameraResolution === "portrait";
      const videoConstraints = getVideoConstraints(isPortraitMode);

      if (recordingType === "camera") {
        const constraints = {
          video: videoConstraints,
          audio: audioConstraints
        };
        finalStream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        finalStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            ...videoConstraints,
            displaySurface: 'monitor'
          },
          audio: audioConstraints
        });
      }

      const options = {
        mimeType: 'video/webm;codecs=h264,opus',
        videoBitsPerSecond: 8000000,
        audioBitsPerSecond: 128000
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
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
        
        navigate("/preview", { state: { videoUrl: URL.createObjectURL(blob), mimeType: mediaRecorder.mimeType } });
      };

      stopPreview();
      mediaRecorder.start(1000);
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