import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const useRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const startRecording = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait",
    existingStream?: MediaStream | null,
    selectedAudioDeviceId?: string
  ) => {
    try {
      let finalStream: MediaStream;

      // Always use portrait constraints for mobile
      const videoConstraints = isMobile ? {
        width: { exact: 1080 },
        height: { exact: 1920 },
        frameRate: { ideal: 30 }
      } : {
        width: { exact: cameraResolution === "landscape" ? 1920 : 1080 },
        height: { exact: cameraResolution === "landscape" ? 1080 : 1920 },
        frameRate: { ideal: 30 }
      };

      const audioConstraints = {
        deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
      };

      console.log('Starting recording with constraints:', {
        video: videoConstraints,
        audio: audioConstraints,
        isMobile,
        resolution: isMobile ? "portrait" : cameraResolution
      });

      // Clean up existing streams
      if (existingStream) {
        existingStream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped existing track: ${track.kind}`);
        });
      }

      if (recordingType === "camera") {
        console.log('Requesting camera stream with audio');
        finalStream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...videoConstraints,
            facingMode: "user"
          },
          audio: audioConstraints
        });
      } else {
        console.log('Requesting screen capture');
        finalStream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
      }

      // Log stream details
      const videoTrack = finalStream.getVideoTracks()[0];
      const audioTrack = finalStream.getAudioTracks()[0];
      
      if (videoTrack) {
        console.log('Recording video track settings:', videoTrack.getSettings());
      }
      if (audioTrack) {
        console.log('Recording audio track settings:', audioTrack.getSettings());
      }

      // Set up MediaRecorder with appropriate options
      const options = {
        mimeType: 'video/webm;codecs=h264,opus',
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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'video/webm' 
        });
        
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType: mediaRecorder.mimeType 
          } 
        });
      };

      console.log('Starting recording...');
      mediaRecorder.start(1000);
      
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Error",
        description: isMobile 
          ? "Please ensure camera and microphone access is enabled in your mobile browser settings."
          : "Failed to start recording. Please check your permissions and try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
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