import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { PopiconsShareLine } from "@popicons/react";
import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import logo from "/static/assets/icons/lnd.png";

const initialFormData = {
  url: "",
  macaroon: "",
};

export default function ConnectLnd() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.lnd",
  });
  const { t: tCommon } = useTranslation("common");
  const [formData, setFormData] = useState(initialFormData);
  const [isDragging, setDragging] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [hasTorSupport, setHasTorSupport] = useState(false);
  const [macaroonVisible, setMacaroonVisible] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    if (formData.url.match(/\.onion/i) && !hasTorSupport) {
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
        validation = await msg.request("validateAccount", account);
      }

      if (validation.valid) {
        const addResult = await msg.request("addAccount", account);
        if (addResult.accountId) {
          await msg.request("selectAccount", {
            id: addResult.accountId,
          });
          navigate("/test-connection");
        }
      } else {
        toast.error(
          <ConnectionErrorToast
            message={validation.error as string}
            link={formData.url}
          />,
          // Don't auto-close
          { duration: 100_000 }
        );
      }
    } catch (e) {
      console.error(e);
      let message = "";
      if (e instanceof Error) {
        message += `${e.message}`;
      }
      toast.error(
        <ConnectionErrorToast
          message={message}
          link={`${formData.url}/v1/getinfo`}
        />
      );
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
      title={t("page.title")}
      description={t("page.description")}
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="url"
          label={t("url.label")}
          placeholder={t("url.placeholder")}
          pattern="https?://.+"
          title={t("url.placeholder")}
          onChange={handleChange}
          required
          autoFocus={true}
        />
      </div>
      {formData.url.match(/\.onion/i) && (
        <div className="mb-6">
          <CompanionDownloadInfo
            hasTorCallback={(hasTor: boolean) => {
              setHasTorSupport(hasTor);
            }}
          />
        </div>
      )}
      <div>
        <div>
          <TextField
            id="macaroon"
            type={macaroonVisible ? "text" : "password"}
            autoComplete="new-password"
            label={t("macaroon.label")}
            value={formData.macaroon}
            onChange={handleChange}
            required
            endAdornment={
              <PasswordViewAdornment
                onChange={(passwordView) => {
                  setMacaroonVisible(passwordView);
                }}
              />
            }
          />
        </div>
        <p className="text-center my-6 dark:text-white">{tCommon("or")}</p>
        <div
          className={`cursor-pointer flex flex-col items-center dark:bg-surface-02dp p-4 py-3 border-dashed border-2 border-gray-300 bg-gray-50 rounded-md text-center transition duration-200 ${
            isDragging ? "border-blue-600 bg-blue-50" : ""
          }`}
          onDrop={dropHandler}
          onDragOver={dragOverHandler}
          onDragLeave={dragLeaveHandler}
          onClick={() => {
            if (hiddenFileInput?.current) hiddenFileInput.current.click();
          }}
        >
          <PopiconsShareLine className="mb-3 h-6 w-6 text-blue-600 hover:text-blue-700" />
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
