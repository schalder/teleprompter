import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

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
    // Only show the toast if we have no devices and at least one permission check has occurred
    if (devices.length === 0 && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          if (permissionStatus.state !== 'granted') {
            toast({
              variant: "destructive",
              title: `No ${label.toLowerCase()} detected`,
              description: `Please connect a ${label.toLowerCase()} and grant permissions.`,
            });
          }
        })
        .catch(() => {
          // If we can't query permissions, don't show the toast
          console.log(`Unable to query ${label.toLowerCase()} permissions`);
        });
    }
  }, [devices, label, toast]);

  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium">{label}</Label>
      <Select value={selectedDevice} onValueChange={onDeviceChange}>
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