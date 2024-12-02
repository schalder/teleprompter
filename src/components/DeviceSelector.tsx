import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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