import { useState, useEffect } from "react";

export function useAudioDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  useEffect(() => {
    // Function to get available audio input devices
    const getAudioDevices = async () => {
      try {
        // Request permission to access media devices
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Get the list of media devices
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        
        // Filter for only audio input devices (microphones)
        const audioInputDevices = deviceList.filter(
          device => device.kind === "audioinput"
        );
        
        setDevices(audioInputDevices);
        
        // Select the first device by default if there is one
        if (audioInputDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    getAudioDevices();

    // Add event listener for device changes
    navigator.mediaDevices.addEventListener("devicechange", getAudioDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getAudioDevices);
    };
  }, []);

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId
  };
}
