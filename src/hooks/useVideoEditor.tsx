import { useState } from 'react';
import { Layer } from '@/types/editor';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

export const useVideoEditor = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const [layers, setLayers] = useState<Layer[]>([
    {
      id: '1',
      name: 'Main Video',
      visible: true,
      type: 'video',
      clips: []
    }
  ]);

  const handleToggleLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      setLayers(prevLayers =>
        prevLayers.map(l =>
          l.id === id ? { ...l, visible: !l.visible } : l
        )
      );
    }
  };

  const handleAddLayer = (type: 'video' | 'audio') => {
    const newLayer: Layer = {
      id: nanoid(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layers.length + 1}`,
      visible: true,
      type,
      clips: [],
      volume: type === 'audio' ? 1 : undefined,
      muted: type === 'audio' ? false : undefined,
    };
    
    setLayers([...layers, newLayer]);
    toast({
      title: 'Layer Added',
      description: `New ${type} layer has been created`,
    });
  };

  const handleVolumeChange = (layerId: string, volume: number) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, volume } : layer
      )
    );
  };

  const handleMuteToggle = (layerId: string) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, muted: !layer.muted } : layer
      )
    );
  };

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    layers,
    setLayers,
    handleToggleLayer,
    handleAddLayer,
    handleVolumeChange,
    handleMuteToggle,
  };
};