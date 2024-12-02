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
    cameraResolution: "landscape" | "portrait",
    existingStream?: MediaStream | null
  ) => {
    try {
      let finalStream: MediaStream;

      // Set exact resolutions based on orientation
      const videoConstraints = {
        width: { exact: cameraResolution === "landscape" ? 1920 : 1080 },
        height: { exact: cameraResolution === "landscape" ? 1080 : 1920 },
        frameRate: { ideal: 30 }
      };

      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
        channelCount: 2
      };

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
        console.log('Creating new camera stream with resolution:', videoConstraints);
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
        
        console.log('Checking stream readiness...');
        console.log('Video track state:', videoTrack.readyState);
        console.log('Audio track state:', audioTrack?.readyState);

        if (videoTrack.readyState === 'live' && (!audioTrack || audioTrack.readyState === 'live')) {
          console.log('Stream is ready');
          resolve(true);
        } else {
          const timeout = setTimeout(() => {
            reject(new Error('Stream initialization timeout'));
          }, 5000);

          videoTrack.onended = () => {
            clearTimeout(timeout);
            reject(new Error('Video track ended'));
          };

          const checkTracks = () => {
            if (videoTrack.readyState === 'live' && (!audioTrack || audioTrack.readyState === 'live')) {
              clearTimeout(timeout);
              resolve(true);
            }
          };

          videoTrack.onunmute = checkTracks;
          if (audioTrack) {
            audioTrack.onunmute = checkTracks;
          }
        }
      });

      // Ensure stable stream with longer delay
      console.log('Waiting for stream stabilization...');
      await new Promise(resolve => setTimeout(resolve, 500));

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