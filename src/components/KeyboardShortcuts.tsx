import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface KeyboardShortcutsProps {
  onPlayPause: () => void;
  onSplit: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const KeyboardShortcuts = ({
  onPlayPause,
  onSplit,
  onUndo,
  onRedo,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          onPlayPause();
          toast({
            title: "Keyboard Shortcut",
            description: "Space: Play/Pause toggle",
          });
          break;
        case 's':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onSplit();
            toast({
              title: "Keyboard Shortcut",
              description: "Ctrl/Cmd + S: Split clip",
            });
          }
          break;
        case 'z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.shiftKey) {
              onRedo();
              toast({
                title: "Keyboard Shortcut",
                description: "Ctrl/Cmd + Shift + Z: Redo",
              });
            } else {
              onUndo();
              toast({
                title: "Keyboard Shortcut",
                description: "Ctrl/Cmd + Z: Undo",
              });
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPlayPause, onSplit, onUndo, onRedo]);

  return null;
};