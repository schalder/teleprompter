import React from 'react';
import { VideoLayers } from '../VideoLayers';
import { Layer } from '@/types/editor';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';

interface LayerManagerProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
}

export const LayerManager = ({ layers, onLayersChange }: LayerManagerProps) => {
  const { toast } = useToast();

  const handleToggleLayer = (id: string) => {
    const newLayers = layers.map((layer) =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    );
    onLayersChange(newLayers);
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
    
    onLayersChange([...layers, newLayer]);
    toast({
      title: 'Layer Added',
      description: `New ${type} layer has been created`,
    });
  };

  const handleVolumeChange = (layerId: string, volume: number) => {
    const newLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, volume } : layer
    );
    onLayersChange(newLayers);
  };

  const handleMuteToggle = (layerId: string) => {
    const newLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, muted: !layer.muted } : layer
    );
    onLayersChange(newLayers);
  };

  return (
    <VideoLayers
      layers={layers}
      onToggleLayer={handleToggleLayer}
      onAddLayer={handleAddLayer}
      onVolumeChange={handleVolumeChange}
      onMuteToggle={handleMuteToggle}
    />
  );
};