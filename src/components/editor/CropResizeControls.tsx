import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Crop, Maximize2, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CropResizeControlsProps {
  onCropChange: (crop: { x: number; y: number; width: number; height: number }) => void;
  onResizeChange: (dimensions: { width: number; height: number }) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const CropResizeControls = ({
  onCropChange,
  onResizeChange,
  videoRef,
}: CropResizeControlsProps) => {
  const [isCropping, setIsCropping] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [cropSelection, setCropSelection] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const cropOverlayRef = useRef<HTMLDivElement>(null);

  const startCropping = () => {
    setIsCropping(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!cropOverlayRef.current || !videoRef.current) return;

    const rect = cropOverlayRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCropSelection({ x, y, width: 0, height: 0 });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !cropOverlayRef.current) return;

    const rect = cropOverlayRef.current.getBoundingClientRect();
    const width = ((e.clientX - rect.left) / rect.width) * 100 - cropSelection.x;
    const height = ((e.clientY - rect.top) / rect.height) * 100 - cropSelection.y;
    
    setCropSelection(prev => ({ ...prev, width, height }));
  };

  const confirmCrop = () => {
    onCropChange(cropSelection);
    setIsCropping(false);
    toast({
      title: "Crop Applied",
      description: "Video has been cropped to selection",
    });
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setCropSelection({ x: 0, y: 0, width: 0, height: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={startCropping} variant={isCropping ? "secondary" : "default"}>
          <Crop className="w-4 h-4 mr-2" />
          Crop
        </Button>
        <Button onClick={() => setIsResizing(!isResizing)} variant={isResizing ? "secondary" : "default"}>
          <Maximize2 className="w-4 h-4 mr-2" />
          Resize
        </Button>
      </div>

      {isCropping && (
        <div 
          ref={cropOverlayRef}
          className="relative border-2 border-primary"
          onMouseDown={handleCropMouseDown}
          onMouseMove={handleCropMouseMove}
        >
          <div
            className="absolute bg-primary/20 border-2 border-primary"
            style={{
              left: `${cropSelection.x}%`,
              top: `${cropSelection.y}%`,
              width: `${cropSelection.width}%`,
              height: `${cropSelection.height}%`,
            }}
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={confirmCrop} size="sm">
              <Check className="w-4 h-4 mr-2" />
              Confirm
            </Button>
            <Button onClick={cancelCrop} variant="destructive" size="sm">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};