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

      // Enhanced stream readiness check with longer timeout
      await new Promise((resolve, reject) => {
        const videoTrack = finalStream.getVideoTracks()[0];
        const audioTrack = finalStream.getAudioTracks()[0];
        
        console.log('Checking stream readiness...');
        console.log('Video track state:', videoTrack.readyState);
        console.log('Audio track state:', audioTrack?.readyState);

        // Function to check if stream is ready
        const isStreamReady = () => {
          return videoTrack.readyState === 'live' && (!audioTrack || audioTrack.readyState === 'live');
        };

        // Initial check
        if (isStreamReady()) {
          console.log('Stream is ready immediately');
          resolve(true);
          return;
        }

        // Set up a longer timeout for stream initialization
        const timeout = setTimeout(() => {
          reject(new Error('Stream initialization timeout'));
        }, 10000); // 10 seconds timeout

        // Set up periodic checks
        const checkInterval = setInterval(() => {
          if (isStreamReady()) {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            console.log('Stream became ready during interval check');
            resolve(true);
          }
        }, 100); // Check every 100ms

        // Clean up on track ended
        videoTrack.onended = () => {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          reject(new Error('Video track ended'));
        };

        // Additional track event listeners
        videoTrack.onunmute = () => {
          if (isStreamReady()) {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            console.log('Stream became ready on unmute');
            resolve(true);
          }
        };
      });

      // Additional stabilization delay
      console.log('Waiting for stream stabilization...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify stream is still valid
      if (!finalStream.active) {
        throw new Error('Stream became inactive during stabilization');
      }

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