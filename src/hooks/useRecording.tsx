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
        width: { ideal: 1080 },
        height: { ideal: 1920 },
        frameRate: { ideal: 30 }
      } : {
        width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
        height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
        frameRate: { ideal: 30 }
      };

      const audioConstraints = selectedAudioDeviceId ? {
        deviceId: { exact: selectedAudioDeviceId },
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
      } : true;

      console.log('Starting recording with constraints:', {
        video: videoConstraints,
        audio: audioConstraints
      });

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
          video: true,
          audio: audioConstraints
        });
      }

      // Verify stream tracks
      const videoTrack = finalStream.getVideoTracks()[0];
      const audioTrack = finalStream.getAudioTracks()[0];

      if (!videoTrack) {
        throw new Error('No video track available');
      }

      console.log('Stream tracks obtained:', {
        video: videoTrack?.label,
        audio: audioTrack?.label
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

      const timeslice = isMobile ? 100 : 1000;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob),
            mimeType: 'video/webm'
          } 
        });
      };

      console.log('Starting recording with timeslice:', timeslice);
      mediaRecorder.start(timeslice);

      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Failed to start recording. Please ensure camera and microphone permissions are granted and try again.",
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