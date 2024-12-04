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

      // Set dimensions based on resolution and device type
      const width = isMobile ? 
        (cameraResolution === "portrait" ? 1080 : 1920) : 
        (cameraResolution === "landscape" ? 1920 : 1080);
      const height = isMobile ? 
        (cameraResolution === "portrait" ? 1920 : 1080) : 
        (cameraResolution === "landscape" ? 1080 : 1920);

      console.log(`Recording with dimensions: ${width}x${height}, resolution: ${cameraResolution}`);

      if (recordingType === "camera") {
        finalStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { exact: width },
            height: { exact: height },
            frameRate: { ideal: 30 }
          },
          audio: selectedAudioDeviceId ? {
            deviceId: { exact: selectedAudioDeviceId },
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          } : true,
        });

        // Double-check video track settings
        const videoTrack = finalStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        console.log('Video track settings:', settings);

        if (settings.width !== width || settings.height !== height) {
          console.log('Applying constraints to match requested dimensions');
          await videoTrack.applyConstraints({
            width: { exact: width },
            height: { exact: height }
          });
        }
      } else {
        finalStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true
        });
      }

      const options = {
        mimeType: 'video/webm;codecs=h264,opus',
        videoBitsPerSecond: 8000000,
        audioBitsPerSecond: 128000
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
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
          type: mediaRecorder.mimeType || 'video/webm' 
        });
        
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType: mediaRecorder.mimeType 
          } 
        });
      };

      mediaRecorder.start(1000);
      
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Recording Error",
        description: "Please check your camera and microphone permissions.",
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