import React, { useState, useEffect, useRef } from "react";
import { QrcodeIcon } from "@heroicons/react/outline";

import Button from "../Button";

declare global {
  interface Window {
    Html5Qrcode: any;
  }
}

type Props = {
  fps?: number;
  qrbox: number;
  qrCodeSuccessCallback: (decodedText: string) => void;
  qrCodeErrorCallback?: () => void;
};

function QrcodeScanner({
  fps = 10,
  qrbox = 250,
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
}: Props) {
  const [isScanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      handleStopScanning(false);
    };
  }, []);

  async function handleRequestCameraPermissions() {
    try {
      const devices = await window.Html5Qrcode.getCameras(); // Request camera permissions.
      if (devices && devices.length) {
        setCameras(devices);
        html5QrCodeRef.current = new window.Html5Qrcode("reader");
        handleStartScanning(devices[0].id);
      }
    } catch (error) {
      alert("Please allow camera access in the settings screen.");
    }
  }

  async function handleStartScanning(id: string) {
    setScanning(true);
    setSelectedCamera(id);
    try {
      if (html5QrCodeRef?.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current
          .start(
            id,
            {
              fps,
              qrbox,
            },
            (decodedText: string) => {
              handleStopScanning();
              qrCodeSuccessCallback(decodedText);
            },
            (errorMessage: string) => {
              // qrCodeErrorCallback(errorMessage);
            }
          )
          .catch(() => {
            // Start failed.
          });
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleStopScanning(isMounted = true) {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
          if (isMounted) setScanning(false);
        })
        .catch(() => {
          // Stop failed.
        });
    }
  }

  return (
    <div className="shadow-sm bg-white rounded-md border border-gray-300 flex flex-col items-center">
      <h4 className="text-xl font-bold my-4">Scan QR Code</h4>

      {!isScanning && (
        <>
          <QrcodeIcon className="h-24 w-24 text-blue-500" aria-hidden="true" />
          <div className="my-6">
            <Button
              label="Start scanning"
              onClick={handleRequestCameraPermissions}
            />
          </div>
        </>
      )}

      <div className="bg-black w-full" id="reader" />

      {isScanning && (
        <div className="my-6 text-center">
          <div className="mb-4">
            <select
              className="w-72 border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              name="cameras"
              id="cameras"
              value={selectedCamera}
              onChange={(e) => handleStartScanning(e.target.value)}
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label}
                </option>
              ))}
            </select>
          </div>
          <Button label="Stop scanning" onClick={() => handleStopScanning()} />
        </div>
      )}
    </div>
  );
}

export default QrcodeScanner;
