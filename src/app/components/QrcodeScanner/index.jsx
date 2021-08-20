import React, { useState, useEffect, useRef } from "react";
import { QrcodeIcon } from "@heroicons/react/outline";

import Button from "../button";

function QrcodeScanner({
  fps = 10,
  qrbox = 250,
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
}) {
  const [isScanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      html5QrCodeRef.current.stop().catch((e) => {
        // Stop failed.
      });
    };
  }, []);

  async function handleRequestCameraPermissions() {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        setScanning(true);
        html5QrCodeRef.current = new Html5Qrcode("reader");
        html5QrCodeRef.current
          .start(
            devices[0].id,
            {
              fps,
              qrbox,
            },
            (decodedText, decodedResult) => {
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
      // handle error
    }
  }

  function handleStopScanning() {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then((ignore) => {
          setScanning(false);
        })
        .catch((e) => {
          // Stop failed.
        });
    }
  }

  return (
    <div className="p-6 shadow-sm rounded-md border border-gray-300 flex flex-col items-center">
      <h4 className="text-xl font-bold mb-4">Scan QR Code</h4>

      {!isScanning && (
        <>
          <QrcodeIcon
            className="mb-6 h-24 w-24 text-blue-500"
            aria-hidden="true"
          />
          <Button
            label="Start scanning"
            onClick={handleRequestCameraPermissions}
          />
        </>
      )}

      <div className="bg-black" id="reader" />

      {isScanning && (
        <div className="mt-6">
          <Button label="Stop scanning" onClick={handleStopScanning} />
        </div>
      )}
    </div>
  );
}

export default QrcodeScanner;
