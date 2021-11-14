import React, { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import Container from "../components/Container";
import Button from "../components/Button";

function Settings() {
  const [cameraPermissionsGranted, setCameraPermissionsGranted] =
    useState(false);

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold dark:text-white">
        Settings
      </h2>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden p-6 dark:bg-gray-800">
        <h3 className="text-gray-700 font-medium dark:text-white">
          Camera access
        </h3>
        <p className="text-gray-400 text-sm">For scanning QR codes</p>
        <div className="mt-2">
          {!cameraPermissionsGranted ? (
            <Button
              label="Allow camera access"
              onClick={async () => {
                try {
                  await Html5Qrcode.getCameras();
                  setCameraPermissionsGranted(true);
                } catch (e) {
                  alert(e);
                }
              }}
            />
          ) : (
            <p className="text-green-500 font-medium">Permission granted</p>
          )}
        </div>
      </div>
    </Container>
  );
}

export default Settings;
