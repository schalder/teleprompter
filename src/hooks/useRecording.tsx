import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const useRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const startRecording = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    existingStream?: MediaStream | null,
    selectedAudioDeviceId?: string
  ) => {
    try {
      let finalStream: MediaStream;

      // Always use portrait resolution on mobile
      const effectiveResolution = isMobile ? "portrait" : cameraResolution;

      const videoConstraints = {
        width: { exact: effectiveResolution === "portrait" ? 1080 : 1920 },
        height: { exact: effectiveResolution === "portrait" ? 1920 : 1080 },
        frameRate: { ideal: 30 }
      };

      const audioConstraints = {
        deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
        channelCount: 2
      };

      // Clean up existing streams
      const existingVideoElement = document.querySelector('video');
      if (existingVideoElement?.srcObject instanceof MediaStream) {
        existingVideoElement.srcObject.getTracks().forEach(track => track.stop());
      }

      if (recordingType === "camera") {
        finalStream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...videoConstraints,
            facingMode: "user"
          },
          audio: audioConstraints
        });
      } else {
        finalStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: audioConstraints
        });
      }

      // Ensure WebM format with proper codecs
      const options = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: isMobile ? 2500000 : 8000000, // Lower bitrate for mobile
        audioBitsPerSecond: 128000
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      console.log('Creating MediaRecorder with options:', options);
      const mediaRecorder = new MediaRecorder(finalStream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: 'video/webm' 
        });
        
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob),
            mimeType: 'video/webm'
          } 
        });
      };

      // Start recording with smaller timeslice for more frequent chunks
      mediaRecorder.start(isMobile ? 500 : 1000);
      
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please ensure camera and microphone permissions are granted and try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      return true;
    }
    return false;
  };

  return {
    startRecording,
    stopRecording,
  };
};