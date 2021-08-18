import React, { useState, useRef } from "react";
import { UploadIcon } from "@heroicons/react/outline";

import Input from "../../../components/Form/input";
import Button from "../../../components/button";
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
  const hiddenFileInput = useRef(null);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
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
      const addResult = await utils.call("addAccount", account);
      console.log(addResult);
      if (addResult.accountId) {
        const selectResult = await utils.call("selectAccount", {
          id: addResult.accountId,
        });
        history.push("/test-connection");
      }
    } catch (e) {
      // TODO: do something with the error, for e.g. display the message to the user.
      console.log(e.message);
    }
  }

  function dropHandler(event) {
    event.preventDefault();
    if (
      event.dataTransfer.items &&
      event.dataTransfer.items[0].kind === "file"
    ) {
      const file = event.dataTransfer.items[0].getAsFile();
      const extension = file.name.split(".").pop();
      if (extension === "macaroon") readFile(file);
    }
    if (isDragging) setDragging(false);
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      const macaroon = utils.bytesToHexString(
        new Uint8Array(evt.target.result)
      );
      if (macaroon) {
        setFormData({
          ...formData,
          macaroon,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function dragOverHandler(event) {
    event.preventDefault();
    if (!isDragging) setDragging(true);
  }

  function dragLeaveHandler(event) {
    if (isDragging) setDragging(false);
  }

  return (
    <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="relative">
        <div className="h-32">
          <img className="mb-12" src="https://i.ibb.co/3F3mCkR/logox.png" />
        </div>
        <h1 className="text-3xl font-bold mt-4">Connect to your remote node</h1>
        <p className="text-gray-500 mt-6">
          You will need to retreive the node url and an admin macaroon. Not sure
          where to find these details?
        </p>
        <p className="text-orange-bitcoin mt-2">Check out this guides.</p>
        <form onSubmit={handleSubmit}>
          <div className="w-4/5">
            <div className="mt-6">
              <label className="block font-medium text-gray-700">Address</label>
              <div>
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
                className={`cursor-pointer flex flex-col items-center p-4 py-10 border-dashed border-2 border-gray-300 bg-gray-50 rounded-md text-center transition duration-200 ${
                  isDragging ? "border-blue-500 bg-blue-50" : ""
                }`}
                onDrop={dropHandler}
                onDragOver={dragOverHandler}
                onDragLeave={dragLeaveHandler}
                onClick={() => hiddenFileInput.current.click()}
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
                    const file = event.target.files[0];
                    readFile(file);
                  }}
                  type="file"
                  accept=".macaroon"
                  hidden
                />
              </div>
            </div>
          </div>
          <div className="mt-8 w-2/5">
            <Button type="submit" label="Continue" />
          </div>
        </form>
      </div>

      <div
        className="mt-10 -mx-4 relative lg:mt-0 lg:flex lg:items-center"
        aria-hidden="true"
      >
        <img src="https://i.ibb.co/QfF1PP6/Frame-20.png" />
      </div>
    </div>
  );
}
