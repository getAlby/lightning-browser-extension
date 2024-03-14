import { PopiconsQrCodeMinimalLine } from "@popicons/react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "~/app/components/Toast";

import Button from "../Button";

interface CameraDevice {
  id: string;
  label: string;
}

type Props = {
  fps?: number;
  qrbox?: number;
  qrCodeSuccessCallback?: (decodedText: string) => void;
  qrCodeErrorCallback?: (errorMessage: string) => void;
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
  const { t } = useTranslation("components", {
    keyPrefix: "qrcode_scanner",
  });

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
      toast.error(t("errors.allow_camera_access"));
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
              qrCodeSuccessCallback && qrCodeSuccessCallback(decodedText);
            },
            (errorMessage: string) => {
              qrCodeErrorCallback && qrCodeErrorCallback(errorMessage);
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
    <div className="mt-5 shadow-sm bg-white rounded-md flex flex-col items-center dark:bg-surface-02dp p-3">
      {!isScanning && (
        <>
          <div className="flex justify-center text-center items-center">
            <div>
              <h4 className="text-lg font-bold mb-2 dark:text-white">
                {t("title")}
              </h4>
              <Button
                primary
                label={t("actions.start_scanning")}
                onClick={handleRequestCameraPermissions}
              />
            </div>
            <PopiconsQrCodeMinimalLine className="h-28 w-28 ml-4 -mr-8 text-blue-600" />
          </div>
        </>
      )}

      <div className="bg-black w-full" id="reader" />

      {isScanning && (
        <div className="mt-6 text-center">
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
          <Button
            label={t("actions.stop_scanning")}
            onClick={() => handleStopScanning()}
          />
        </div>
      )}
    </div>
  );
}

export default QrcodeScanner;
