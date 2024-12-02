import React from 'react';
import { useLocation } from 'react-router-dom';
import { SimpleVideoEditor } from '@/components/editor/SimpleVideoEditor';

const VideoEditor = () => {
  const location = useLocation();
  const videoUrl = location.state?.videoUrl;

  if (!videoUrl) {
    return <div className="p-4">No video selected</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">Video Editor</h1>
        <SimpleVideoEditor videoUrl={videoUrl} />
      </div>
    </div>
  );
};

export default VideoEditor;