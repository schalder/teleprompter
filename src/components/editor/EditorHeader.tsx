import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EditorHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center mb-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mr-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">Video Editor</h1>
    </div>
  );
};