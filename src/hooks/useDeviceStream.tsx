// src/hooks/useDeviceStream.tsx

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useDeviceStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  /**
   * Acquires a MediaStream from the user's camera and microphone.
   *
   * @param videoDeviceId - (Optional) Specific video device ID to use.
   * @param audioDeviceId - (Optional) Specific audio device ID to use.
   * @param aspectRatio - Desired aspect ratio ('landscape' or 'portrait').
   * @returns Promise<MediaStream | null> - The acquired MediaStream or null if failed.
   */
  const getDeviceStream = async (
    videoDeviceId: string,
    audioDeviceId: string,
    aspectRatio: "landscape" | "portrait"
  ): Promise<MediaStream | null> => {
    try {
      // Stop and clear any existing stream to prevent conflicts
      if (stream) {
        console.log('Stopping existing stream:', stream.id);
        stream.getTracks().forEach((track) => {
          console.log(`Stopping track: ${track.kind} - ${track.label}`);
          track.stop();
        });
      }

      // Define video constraints based on the desired aspect ratio
      const videoConstraints: MediaTrackConstraints = {
        deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
        aspectRatio: aspectRatio === "landscape" ? 16 / 9 : 9 / 16,
        width: { ideal: aspectRatio === "landscape" ? 1920 : 1080 },
        height: { ideal: aspectRatio === "landscape" ? 1080 : 1920 },
        frameRate: { ideal: 30 }, // Ensures smooth video playback
        facingMode: "user", // Front-facing camera
      };

      // Define audio constraints
      const audioConstraints: MediaTrackConstraints = {
        deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000, // Higher sample rate for better audio quality
      };

      // Combine video and audio constraints
      const constraints: MediaStreamConstraints = {
        video: videoConstraints,
        audio: audioConstraints,
      };

      console.log('Requesting media with constraints:', constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtained with tracks:', newStream.getTracks().map(t => ({ kind: t.kind, label: t.label })));
      
      setStream(newStream);
      return newStream;
    } catch (error) {
      console.error('Error getting device stream:', error);
      toast({
        variant: "destructive",
        title: "Device Error",
        description: "Failed to access camera or microphone. Please check permissions and device connections.",
      });
      return null;
    }
  };

  return { stream, getDeviceStream };
};
