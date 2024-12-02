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

      // Enhanced stream readiness check with comprehensive validation
      await new Promise((resolve, reject) => {
        const videoTrack = finalStream.getVideoTracks()[0];
        const audioTrack = finalStream.getAudioTracks()[0];
        
        console.log('Starting stream validation...');
        console.log('Video track state:', videoTrack.readyState);
        console.log('Audio track state:', audioTrack?.readyState);
        console.log('Video track settings:', videoTrack.getSettings());

        // Function to check if stream is fully ready
        const isStreamReady = () => {
          if (!videoTrack || videoTrack.readyState !== 'live') return false;
          if (audioTrack && audioTrack.readyState !== 'live') return false;

          const settings = videoTrack.getSettings();
          return settings.width && settings.height && // Has dimensions
                 settings.frameRate && // Has framerate
                 videoTrack.enabled && // Is enabled
                 finalStream.active; // Stream is active
        };

        // Initial check
        if (isStreamReady()) {
          console.log('Stream is ready immediately with settings:', videoTrack.getSettings());
          resolve(true);
          return;
        }

        let frameCount = 0;
        const imageCapture = new ImageCapture(videoTrack);
        
        // Set up frame checking
        const checkFrame = async () => {
          try {
            const frame = await imageCapture.grabFrame();
            frameCount++;
            console.log(`Frame ${frameCount} captured: ${frame.width}x${frame.height}`);
            frame.close();
            return true;
          } catch (error) {
            console.log('Frame capture failed:', error);
            return false;
          }
        };

        // Set up a longer timeout for stream initialization
        const timeout = setTimeout(() => {
          reject(new Error('Stream initialization timeout'));
        }, 10000); // 10 seconds timeout

        // Set up periodic checks
        const checkInterval = setInterval(async () => {
          if (await checkFrame() && isStreamReady()) {
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
        videoTrack.onunmute = async () => {
          if (await checkFrame() && isStreamReady()) {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            console.log('Stream became ready on unmute');
            resolve(true);
          }
        };
      });

      // Additional stabilization delay with active checking
      console.log('Starting final stream stabilization...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Final verification
      const videoTrack = finalStream.getVideoTracks()[0];
      if (!finalStream.active || !videoTrack || videoTrack.readyState !== 'live') {
        throw new Error('Stream failed final validation check');
      }

      console.log('Stream passed all validation checks');

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