import { useState, useRef } from "react";
import { SendIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import browser from "webextension-polyfill";

import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";

import utils from "../../../../common/lib/utils";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

export default function ConnectLnd() {
  const navigate = useNavigate();
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

  function getConnectorType() {
    if (formData.url.match(/\.onion/i)) {
      return "nativelnd";
    }
    // default to LND
    return "lnd";
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
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelnd") {
        validation = { valid: true, error: "" };
        const permissionGranted = await browser.permissions.request({
          permissions: ["nativeMessaging"],
        });
        if (!permissionGranted) {
          validation = {
            valid: false,
            error: "Native permissions are required to connect through Tor.",
          };
        }
      } else {
        validation = await utils.call("validateAccount", account);
      }

      if (validation.valid) {
        const addResult = await utils.call("addAccount", account);
        if (addResult.accountId) {
          await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          navigate("/test-connection");
        }
      } else {
        alert(`
          Connection failed. Are your LND credentials correct? \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Are your LND credentials correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
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
    <form onSubmit={handleSubmit}>
      <div className="relative mt-14 lg:flex space-x-8 bg-white dark:bg-gray-800 px-12 py-10">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white">
            Connect to your LND node
          </h1>
          <p className="text-gray-500 mt-6 dark:text-gray-400">
            You will need to retrieve the node url and an admin <br /> macaroon.
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <label className="block font-medium text-gray-700 dark:text-white">
                Address
              </label>
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
              <p className="text-center my-4 dark:text-white">OR</p>
              <div
                className={`cursor-pointer flex flex-col items-center dark:bg-gray-800 p-4 py-10 border-dashed border-2 border-gray-300 bg-gray-50 rounded-md text-center transition duration-200 ${
                  isDragging ? "border-blue-500 bg-blue-50" : ""
                }`}
                onDrop={dropHandler}
                onDragOver={dragOverHandler}
                onDragLeave={dragLeaveHandler}
                onClick={() => {
                  if (hiddenFileInput?.current) hiddenFileInput.current.click();
                }}
              >
                <SendIcon className="mb-3 h-9 w-9 text-blue-500" />
                <p className="dark:text-white">
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
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <div className="lg:flex h-full justify-center items-center">
            <img src="assets/icons/satsymbol.svg" alt="sat" className="w-64" />
          </div>
        </div>
      </div>
      <div className="my-8 flex space-x-4 justify-center">
        <Button
          label="Back"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
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
  );
}
