import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const useRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startRecording = async (
    recordingType: "camera" | "screen",
    cameraResolution: "landscape" | "portrait"
  ) => {
    try {
      let finalStream: MediaStream;

      const videoConstraints = {
        width: { ideal: cameraResolution === "landscape" ? 1920 : 1080 },
        height: { ideal: cameraResolution === "landscape" ? 1080 : 1920 },
        frameRate: { ideal: 30 }
      };

      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
        channelCount: 2
      };

      if (recordingType === "camera") {
        finalStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
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
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your permissions.",
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