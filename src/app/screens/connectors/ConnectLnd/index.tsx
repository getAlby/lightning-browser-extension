import { SendIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

const initialFormData = {
  url: "",
  macaroon: "",
};

export default function ConnectLnd() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.lnd",
  });
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
        toast.error(`
          ${t("errors.connection_failed")} \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message = t("errors.connection_failed");
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
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
    <ConnectorForm
      title={t("page_title")}
      description={t("page_description")}
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="url"
          label={t("port_label")}
          placeholder={t("url_placeholder")}
          pattern="https://.+"
          title={t("url_placeholder")}
          onChange={handleChange}
          required
        />
      </div>
      {formData.url.match(/\.onion/i) && (
        <div className="mb-6">
          <CompanionDownloadInfo />
        </div>
      )}
      <div>
        <div>
          <TextField
            id="macaroon"
            label={t("macaroon_label")}
            value={formData.macaroon}
            onChange={handleChange}
            required
          />
        </div>
        <p className="text-center my-4 dark:text-white">OR</p>
        <div
          className={`cursor-pointer flex flex-col items-center dark:bg-surface-02dp p-4 py-3 border-dashed border-2 border-gray-300 bg-gray-50 rounded-md text-center transition duration-200 ${
            isDragging ? "border-blue-500 bg-blue-50" : ""
          }`}
          onDrop={dropHandler}
          onDragOver={dragOverHandler}
          onDragLeave={dragLeaveHandler}
          onClick={() => {
            if (hiddenFileInput?.current) hiddenFileInput.current.click();
          }}
        >
          <SendIcon className="mb-3 h-6 w-6 text-blue-500" />
          <p className="dark:text-white">
            <Trans
              i18nKey={"drag_and_drop"}
              t={t}
              // eslint-disable-next-line react/jsx-key
              components={[<span className="underline"></span>]}
            />
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
    </ConnectorForm>
  );
}
