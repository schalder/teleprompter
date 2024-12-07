import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

type RecordingType = "camera" | "screen";
type CameraResolution = "landscape" | "portrait";

export const useRecording = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to obtain MediaStream with constraints
  const getMediaStream = async (
    recordingType: RecordingType,
    cameraResolution: CameraResolution
  ): Promise<MediaStream> => {
    if (recordingType === "camera") {
      // Define resolution based on cameraResolution
      let constraints: MediaStreamConstraints = {
        video: {
          // Enforce exact width and height for aspect ratio
          width: cameraResolution === "portrait" ? 1080 : 1920,
          height: cameraResolution === "portrait" ? 1920 : 1080,
          facingMode: "user",
          // Optional: frameRate can be set for smoother video
          frameRate: { ideal: 30 },
        },
        audio: true,
      };

      // You can also make resolution configurable if needed
      // For example, accept desired resolution as a parameter

      return await navigator.mediaDevices.getUserMedia(constraints);
    } else {
      // For screen recording, you might not have strict aspect ratio control
      return await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
    }
  };

  const startRecording = async (
    recordingType: RecordingType,
    cameraResolution: CameraResolution,
    selectedAudioDeviceId?: string
  ) => {
    try {
      // Obtain MediaStream with desired constraints
      const stream = await getMediaStream(recordingType, cameraResolution);

      // If a specific audio device is selected, adjust the audio tracks
      if (selectedAudioDeviceId) {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          // Stop existing audio tracks
          audioTracks.forEach((track) => track.stop());

          // Create new audio track with the selected device
          const audioConstraints = {
            audio: { deviceId: { exact: selectedAudioDeviceId } },
            video: false,
          };
          const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
          const newAudioTrack = audioStream.getAudioTracks()[0];
          stream.addTrack(newAudioTrack);
        }
      }

      console.log('Starting recording with stream:', {
        id: stream.id,
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          label: t.label,
          settings: t.getSettings(),
        })),
      });

      // Clear any existing chunks
      chunksRef.current = [];

      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 8000000, // 8 Mbps for high quality
        audioBitsPerSecond: 192000,  // 192 Kbps for audio
      };
      
      // Fallback if vp8 is not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data chunk received:', event.data.size);
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, total chunks:', chunksRef.current.length);
        
        if (chunksRef.current.length === 0) {
          toast({
            title: "Recording Error",
            description: "No data was recorded. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const blob = new Blob(chunksRef.current, { 
          type: 'video/webm' 
        });
        
        console.log('Final blob size:', blob.size);
        
        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType: 'video/webm',
          } 
        });

        // Stop all tracks to release resources
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording, requesting data every 250ms (more frequent for better responsiveness)
      mediaRecorderRef.current.start(250);
      
      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
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
