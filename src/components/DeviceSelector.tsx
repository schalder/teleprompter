import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeviceSelectorProps {
  label: string;
  devices: MediaDeviceInfo[];
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
  placeholder: string;
}

const DeviceSelector = ({
  label,
  devices,
  selectedDevice,
  onDeviceChange,
  placeholder,
}: DeviceSelectorProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (devices.length === 0) {
      toast({
        variant: "destructive",
        title: `No ${label.toLowerCase()} detected`,
        description: `Please connect a ${label.toLowerCase()} and grant permissions.`,
      });
    }
  }, [devices, label, toast]);

  // Only show the error alert if there are truly no devices available
  // and we're specifically looking for audio devices (microphone)
  if (devices.length === 0 && label.toLowerCase() === "microphone") {
    return (
      <div className="space-y-2">
        <Label className="text-lg font-medium">{label}</Label>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No {label.toLowerCase()} detected. Please connect a device and grant permissions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium">{label}</Label>
      <Select 
        value={selectedDevice || devices[0]?.deviceId} 
        onValueChange={onDeviceChange}
      >
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
          <SelectValue placeholder={placeholder} className="text-gray-300" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {devices.map((device) => (
            <SelectItem 
              key={device.deviceId} 
              value={device.deviceId} 
              className="text-white hover:bg-gray-700"
            >
              {device.label || `${label} ${devices.indexOf(device) + 1}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DeviceSelector;