import { QrCodeIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import QrScanner from "qr-scanner";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import Button from "../Button";

interface CameraDevice {
  id: string;
  label: string;
}

interface ScanResult {
  data: string;
  cornerPoints: QrScanner.Point[];
}

type Props = {
  fps?: number;
  qrbox?: number;
  qrCodeSuccessCallback?: (decodedText: string) => void;
  qrCodeErrorCallback?: (errorMessage: Error | string) => void;
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
  const qrScannerRef = useRef<QrScanner>();
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
      const devices = await QrScanner.listCameras();
      const video = document.querySelector<HTMLVideoElement>("#reader");
      if (video && devices && devices.length) {
        setCameras(devices);
        const onDecode = (result: ScanResult) => {
          handleStopScanning();
          qrCodeSuccessCallback && qrCodeSuccessCallback(result.data);
        };
        qrScannerRef.current = new QrScanner(video, onDecode, {
          returnDetailedScanResult: true,
          onDecodeError: qrCodeErrorCallback,
        });
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
      if (qrScannerRef.current) {
        qrScannerRef.current.setCamera(id);
        // Stop if there's already a scanner active.
        qrScannerRef.current.stop();
        qrScannerRef.current.start();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleStopScanning(isMounted = true) {
    try {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        if (isMounted) setScanning(false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mt-5 shadow-sm bg-white rounded-md border border-gray-300 flex flex-col items-center dark:bg-surface-02dp p-3">
      {!isScanning && (
        <>
          <div className="flex justify-center text-center items-center">
            <div>
              <h4 className="text-lg font-bold mb-2 dark:text-white">
                {t("title")}
              </h4>
              <Button
                label={t("actions.start_scanning")}
                onClick={handleRequestCameraPermissions}
              />
            </div>
            <QrCodeIcon className="h-28 w-28 ml-4 -mr-8 text-blue-500" />
          </div>
        </>
      )}

      <video
        className={`bg-black w-full ${!isScanning ? "hidden" : ""}`}
        id="reader"
      />

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
