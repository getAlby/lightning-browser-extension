import React, { useState, useEffect, useRef } from "react";
import { QrcodeIcon } from "@heroicons/react/outline";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

import Button from "../Button";

interface CameraDevice {
  id: string;
  label: string;
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
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const html5QrCodeRef = useRef<Html5Qrcode>();

  useEffect(() => {
    return () => {
      handleStopScanning(false);
    };
  }, []);

  async function handleRequestCameraPermissions() {
    try {
      const devices = await Html5Qrcode.getCameras(); // Request camera permissions.
      if (devices && devices.length) {
        setCameras(devices);
        html5QrCodeRef.current = new Html5Qrcode("reader", false);
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
      if (html5QrCodeRef.current) {
        // Stop if there's already a scanner active.
        try {
          const scannerState = html5QrCodeRef.current.getState();
          if (
            [
              Html5QrcodeScannerState.PAUSED,
              Html5QrcodeScannerState.SCANNING,
            ].includes(scannerState)
          ) {
            await html5QrCodeRef.current.stop();
          }
        } catch (e) {
          console.error(e);
        }

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

  async function handleStopScanning(isMounted = true) {
    try {
      if (html5QrCodeRef.current) {
        const scannerState = html5QrCodeRef.current.getState();
        if (
          [
            Html5QrcodeScannerState.PAUSED,
            Html5QrcodeScannerState.SCANNING,
          ].includes(scannerState)
        ) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
        if (isMounted) setScanning(false);
      }
    } catch (e) {
      console.error(e);
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
