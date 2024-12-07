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
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: cameraResolution === "portrait" ? 720 : 1280 },
          height: { ideal: cameraResolution === "portrait" ? 1280 : 720 },
          facingMode: "user",
          frameRate: { ideal: 30 },
        },
        audio: true,
      };

      return await navigator.mediaDevices.getUserMedia(constraints);
    } else {
      // For screen recording, aspect ratio may vary
      return await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
    }
  };

  const getSupportedMimeType = (): string => {
    const supportedTypes = [
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    throw new Error('No supported MIME type found for MediaRecorder.');
  };

  const startRecording = async (
    recordingType: RecordingType,
    cameraResolution: CameraResolution,
    selectedAudioDeviceId?: string
  ) => {
    try {
      // Obtain MediaStream with desired constraints
      const stream = await getMediaStream(recordingType, cameraResolution);
      console.log('Stream acquired:', {
        id: stream.id,
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          label: t.label,
          settings: t.getSettings(),
        })),
      });

      // If a specific audio device is selected, adjust the audio tracks
      if (selectedAudioDeviceId) {
        const audioDevices = await navigator.mediaDevices.enumerateDevices();
        const selectedDevice = audioDevices.find(device => device.deviceId === selectedAudioDeviceId && device.kind === 'audioinput');
        if (!selectedDevice) {
          throw new Error('Selected audio device not found.');
        }

        // Stop existing audio tracks
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach(track => track.stop());

        // Create new audio track with the selected device
        const audioConstraints = {
          audio: { deviceId: { exact: selectedAudioDeviceId } },
          video: false,
        };
        const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        const newAudioTrack = audioStream.getAudioTracks()[0];
        stream.addTrack(newAudioTrack);
        console.log('Added selected audio track:', newAudioTrack.label);
      }

      // Clear any existing chunks
      chunksRef.current = [];

      // Determine supported MIME type
      const mimeType = getSupportedMimeType();
      console.log('Using MIME type:', mimeType);

      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps for high quality
        audioBitsPerSecond: 192000,  // 192 Kbps for audio
      };

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      console.log('MediaRecorder initialized:', mediaRecorderRef.current);

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

        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Final blob size:', blob.size);

        navigate("/preview", { 
          state: { 
            videoUrl: URL.createObjectURL(blob), 
            mimeType,
          } 
        });

        // Stop all tracks to release resources
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording, requesting data every 250ms
      mediaRecorderRef.current.start(250);
      console.log('Recording started');

      toast({
        title: "Recording started",
        description: "Click Stop when you're done recording.",
      });

      return true;
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Recording Error",
        description: `Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
      return false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped by user');
      return true;
    }
    console.warn('No active recording to stop');
    return false;
  };

  return {
    startRecording,
    stopRecording,
  };
};
