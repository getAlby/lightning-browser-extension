import React, { useState, useRef } from "react";
import { UploadIcon } from "@heroicons/react/outline";

import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useHistory } from "react-router-dom";

import utils from "../../../../common/lib/utils";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

export default function ConnectLnd() {
  const history = useHistory();
  const [formData, setFormData] = useState(initialFormData);
  const [isDragging, setDragging] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { url, macaroon } = formData;
    const account = {
      name: "LND",
      config: {
        macaroon,
        url,
      },
      connector: "lnd",
    };

    try {
      const validation = await utils.call("validateAccount", account);
      if (validation.valid) {
        const addResult = await utils.call("addAccount", account);
        if (addResult.accountId) {
          await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          history.push("/test-connection");
        }
      } else {
        console.log(validation);
        alert(`
          Connection failed. Are your LND credentials correct? \n\n(${validation.error})`);
      }
    } catch (e) {
      let message = "Connection failed. Are your LND credentials correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      console.log(e);
      alert(message);
    }
    setLoading(false);
  }

  function dropHandler(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (
      event.dataTransfer.items &&
      event.dataTransfer.items[0].kind === "file"
    ) {
      const file = event.dataTransfer.items[0].getAsFile();
      if (file) {
        const extension = file.name.split(".").pop();
        if (extension === "macaroon") readFile(file);
      }
    }
    if (isDragging) setDragging(false);
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      if (evt.target?.result) {
        const macaroon = utils.bytesToHexString(
          new Uint8Array(evt.target.result as ArrayBuffer)
        );
        if (macaroon) {
          setFormData({
            ...formData,
            macaroon,
          });
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function dragOverHandler(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!isDragging) setDragging(true);
  }

  function dragLeaveHandler(event: React.DragEvent<HTMLDivElement>) {
    if (isDragging) setDragging(false);
  }

  return (
    <div className="relative mt-24 lg:flex space-x-8">
      <div className="lg:w-1/2">
        <h1 className="text-3xl font-bold">Connect to your LND node</h1>
        <p className="text-gray-500 mt-6">
          You will need to retrieve the node url and an admin macaroon.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="w-4/5">
            <div className="mt-6">
              <label className="block font-medium text-gray-700">Address</label>
              <div className="mt-1">
                <Input
                  name="url"
                  placeholder="https://"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <div>
                <label className="block font-medium text-gray-700">
                  Macaroon
                </label>
                <div className="mt-1">
                  <Input
                    name="macaroon"
                    value={formData.macaroon}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <p className="text-center my-4">OR</p>
              <div
                className={`cursor-pointer bg-white flex flex-col items-center p-4 py-10 border-dashed border-2 border-gray-300 bg-gray-50 rounded-md text-center transition duration-200 ${
                  isDragging ? "border-blue-500 bg-blue-50" : ""
                }`}
                onDrop={dropHandler}
                onDragOver={dragOverHandler}
                onDragLeave={dragLeaveHandler}
                onClick={() => {
                  if (hiddenFileInput?.current) hiddenFileInput.current.click();
                }}
              >
                <UploadIcon
                  className="mb-3 h-9 w-9 text-blue-500"
                  aria-hidden="true"
                />
                <p>
                  Drag and drop your macaroon here or{" "}
                  <span className="underline">browse</span>
                </p>
                <input
                  ref={hiddenFileInput}
                  onChange={(event) => {
                    if (event.target.files) {
                      const file = event.target.files[0];
                      readFile(file);
                    }
                  }}
                  type="file"
                  accept=".macaroon"
                  hidden
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex space-x-4">
            <Button
              label="Back"
              onClick={(e) => {
                e.preventDefault();
                history.goBack();
                return false;
              }}
            />
            <Button
              type="submit"
              label="Continue"
              primary
              loading={loading}
              disabled={formData.url === "" || formData.macaroon === ""}
            />
          </div>
        </form>
      </div>
      <div className="mt-16 lg:mt-0 lg:w-1/2">
        <div className="lg:flex h-full justify-center items-center">
          <img
            src="assets/icons/satsymbol.svg"
            alt="Sats"
            className="max-w-xs"
          />
        </div>
      </div>
    </div>
  );
}
