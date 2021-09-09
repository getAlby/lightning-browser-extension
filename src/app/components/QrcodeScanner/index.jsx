import React, { useState, useEffect, useRef } from "react";
import { QrcodeIcon } from "@heroicons/react/outline";

import Button from "../Button";

function QrcodeScanner({
  fps = 10,
  qrbox = 250,
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
}) {
  const [isScanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return handleStopScanning;
  }, []);

  async function handleRequestCameraPermissions() {
    try {
      const devices = await window.Html5Qrcode.getCameras();
      if (devices && devices.length) {
        setScanning(true);
        html5QrCodeRef.current = new window.Html5Qrcode("reader");
        html5QrCodeRef.current
          .start(
            devices[0].id,
            {
              fps,
              qrbox,
            },
            (decodedText, decodedResult) => {
              handleStopScanning();
              qrCodeSuccessCallback(decodedText);
            },
            (errorMessage) => {
              // qrCodeErrorCallback(errorMessage);
            }
          )
          .catch((e) => {
            // Start failed.
          });
      }
    } catch (error) {
      alert("Please allow camera access in the settings screen.");
    }
  }

  function handleStopScanning() {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then((ignore) => {
          setScanning(false);
          html5QrCodeRef.current.clear();
        })
        .catch((e) => {
          // Stop failed.
        });
    }
  }

  return (
    <div className="shadow-sm rounded-md border border-gray-300 flex flex-col items-center">
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
        <div className="my-6">
          <Button label="Stop scanning" onClick={handleStopScanning} />
        </div>
      )}
    </div>
  );
}

export default QrcodeScanner;
