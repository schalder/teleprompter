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

      // Set video constraints based on device type
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
        channelCount: 2
      };

      console.log('Starting recording with audio device:', selectedAudioDeviceId);

      // Clean up any existing streams
      const existingVideoElement = document.querySelector('video');
      if (existingVideoElement?.srcObject instanceof MediaStream) {
        console.log('Cleaning up existing stream');
        existingVideoElement.srcObject.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped track: ${track.kind}`);
        });
      }

      if (recordingType === "camera") {
        console.log('Creating new camera stream with audio constraints:', audioConstraints);
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

      // Enhanced stream readiness check
      await new Promise((resolve, reject) => {
        const videoTrack = finalStream.getVideoTracks()[0];
        const audioTrack = finalStream.getAudioTracks()[0];
        
        if (!videoTrack || videoTrack.readyState !== 'live') {
          reject(new Error('Video track not ready'));
          return;
        }

        resolve(true);
      });

      const options = {
        mimeType: 'video/webm;codecs=h264,opus',
        videoBitsPerSecond: 8000000,
        audioBitsPerSecond: 128000
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }
      
      console.log('Creating MediaRecorder with options:', options);
      const mediaRecorder = new MediaRecorder(finalStream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Use smaller timeslice for mobile to prevent truncation
      const timeslice = isMobile ? 100 : 1000;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

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

      console.log('Starting recording...');
      mediaRecorder.start(timeslice);
      
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