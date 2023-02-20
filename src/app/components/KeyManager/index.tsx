import {
  CopyIcon,
  CrossIcon,
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import TextField from "@components/form/TextField";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import msg from "~/common/lib/msg";
import nostrlib from "~/common/lib/nostr";
import Liquid from "~/extension/background-script/liquid";
import Nostr from "~/extension/background-script/nostr";
import { Account } from "~/types";

type Props = {
  type: "nostr" | "liquid";
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  account: Omit<Account, "connector" | "config" | "nostrPrivateKey">;
  accountPrivateKey: string;
};

function KeyManager({
  type,
  title,
  subtitle,
  account,
  accountPrivateKey,
}: Props) {
  const auth = useAccount();
  const { t } = useTranslation("components", {
    keyPrefix: "key_manager",
  });
  const { t: tCommon } = useTranslation("common");
  const [currentPrivateKey, setCurrentPrivateKey] = useState(accountPrivateKey);
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [privateKeyCopyLabel, setPrivateKeyCopyLabel] = useState(
    tCommon("actions.copy") as string
  );
  const [publicKeyCopyLabel, setPublicKeyCopyLabel] = useState(
    tCommon("actions.copy") as string
  );
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const generatePublicKey = useCallback(
    (priv: string) => {
      const nostrOrLiquid =
        type === "nostr" ? new Nostr(priv) : new Liquid(priv);
      const pubkeyHex = nostrOrLiquid.getPublicKey();
      return type === "nostr"
        ? nostrlib.hexToNip19(pubkeyHex, "npub")
        : pubkeyHex;
    },
    [type]
  );

  async function generatePrivateKey(random?: boolean) {
    if (type === "liquid") {
      const result = await msg.request("liquid/generatePrivateKey");
      savePrivateKey(result.privateKey as string);
      closeModal();
      return;
    }

    const selectedAccount = await auth.fetchAccountInfo();

    if (!random && selectedAccount?.id !== account.id) {
      alert(
        `Please match the account in the account dropdown at the top with this account to derive keys.`
      );
      closeModal();
      return;
    }
    // check with current selected account
    const result = await msg.request(
      "nostr/generatePrivateKey",
      random
        ? {
            type: "random",
          }
        : undefined
    );
    savePrivateKey(result.privateKey as string);
    closeModal();
  }

  async function savePrivateKey(privateKey: string) {
    privateKey = nostrlib.normalizeToHex(privateKey);

    if (privateKey === currentPrivateKey) return;

    if (currentPrivateKey && !confirm(t("private_key.warning"))) {
      return;
    }

    try {
      if (!account) {
        // type guard
        throw new Error("No account available");
      }

      // Validate the private key before saving
      generatePublicKey(privateKey);
      type === "nostr" && nostrlib.hexToNip19(privateKey, "nsec");

      await msg.request(`${type}/setPrivateKey`, {
        id: account.id,
        privateKey: privateKey,
      });

      if (privateKey) {
        toast.success(t("private_key.success"));
      } else {
        toast.success(t("private_key.successfully_removed"));
      }
      setCurrentPrivateKey(privateKey);
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  }

  useEffect(() => {
    try {
      setPublicKey(
        currentPrivateKey ? generatePublicKey(currentPrivateKey) : ""
      );
      type === "nostr"
        ? setPrivateKey(
            currentPrivateKey
              ? nostrlib.hexToNip19(currentPrivateKey, "nsec")
              : ""
          )
        : setPrivateKey(currentPrivateKey);
    } catch (e) {
      if (e instanceof Error)
        toast.error(
          <p>
            {t("errors.failed_to_load", { type })}
            <br />
            {e.message}
          </p>
        );
    }
  }, [currentPrivateKey, generatePublicKey, t, type]);

  function closeModal() {
    setModalIsOpen(false);
  }

  return (
    <>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 dark:bg-surface-02dp">
        <div className="py-4 flex justify-between items-center">
          <div>
            <span className="text-gray-900 dark:text-white font-medium">
              {title}
            </span>
            <p className="text-gray-500 mr-1 dark:text-neutral-500 text-sm">
              {subtitle}
            </p>
          </div>
          <div className="w-1/5 flex-none ml-6">
            <Button
              label={t("generate_keys.label")}
              onClick={() =>
                type === "nostr" ? setModalIsOpen(true) : generatePrivateKey()
              }
              fullWidth
            />
          </div>
        </div>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            savePrivateKey(privateKey);
          }}
          className="mb-4 flex justify-between items-end"
        >
          <div className="w-7/12">
            <TextField
              id={`${type}PrivateKey`}
              label={t("private_key.label")}
              type={privateKeyVisible ? "text" : "password"}
              value={privateKey}
              onChange={(event) => {
                setPrivateKey(event.target.value);
              }}
              endAdornment={
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex justify-center items-center w-10 h-8"
                  onClick={() => {
                    setPrivateKeyVisible(!privateKeyVisible);
                  }}
                >
                  {privateKeyVisible ? (
                    <HiddenIcon className="h-6 w-6" />
                  ) : (
                    <VisibleIcon className="h-6 w-6" />
                  )}
                </button>
              }
            />
          </div>
          <div className="w-1/5 flex-none mx-4">
            <Button
              icon={<CopyIcon className="w-6 h-6 mr-2" />}
              label={privateKeyCopyLabel}
              onClick={async () => {
                try {
                  navigator.clipboard.writeText(privateKey);
                  setPrivateKeyCopyLabel(tCommon("copied"));
                  setTimeout(() => {
                    setPrivateKeyCopyLabel(tCommon("actions.copy"));
                  }, 1000);
                } catch (e) {
                  if (e instanceof Error) {
                    toast.error(e.message);
                  }
                }
              }}
              fullWidth
            />
          </div>
          <div className="w-1/5 flex-none">
            <Button
              type="submit"
              label={tCommon("actions.save")}
              disabled={
                nostrlib.normalizeToHex(privateKey) === currentPrivateKey
              }
              primary
              fullWidth
            />
          </div>
        </form>

        <div className="mb-4 flex justify-between items-end">
          <div className="w-7/12">
            <TextField
              id={`${type}PublicKey`}
              label={t("public_key.label")}
              type="text"
              value={publicKey}
              disabled
            />
          </div>
          <div className="w-1/5 flex-none mx-4">
            <Button
              icon={<CopyIcon className="w-6 h-6 mr-2" />}
              label={publicKeyCopyLabel}
              onClick={async () => {
                try {
                  navigator.clipboard.writeText(publicKey);
                  setPublicKeyCopyLabel(tCommon("copied"));
                  setTimeout(() => {
                    setPublicKeyCopyLabel(tCommon("actions.copy"));
                  }, 1000);
                } catch (e) {
                  if (e instanceof Error) {
                    toast.error(e.message);
                  }
                }
              }}
              fullWidth
            />
          </div>
          <div className="w-1/5 flex-none d-none"></div>
        </div>
      </div>

      <Modal
        ariaHideApp={false}
        closeTimeoutMS={200}
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={t("generate_keys.screen_reader")}
        overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
        className="rounded-lg bg-white w-full max-w-lg"
      >
        <div className="p-5 flex justify-between dark:bg-surface-02dp">
          <h2 className="text-2xl font-bold dark:text-white">
            {t("generate_keys.label")}
          </h2>
          <button onClick={closeModal}>
            <CrossIcon className="w-6 h-6 dark:text-white" />
          </button>
        </div>
        <div className="p-5 border-t border-b dark:text-white border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
          <Trans
            i18nKey={"generate_keys.hint"}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <br />,
              // eslint-disable-next-line react/jsx-key
              <a
                className="underline"
                target="_blank"
                rel="noreferrer noopener"
                href="https://guides.getalby.com/overall-guide/alby-browser-extension/features/nostr"
              ></a>,
            ]}
          />
        </div>
        <div className="p-4 dark:bg-surface-02dp">
          <div className="flex flex-row justify-between">
            <Button
              type="submit"
              onClick={() => generatePrivateKey(true)}
              label={t("generate_keys.actions.random_keys")}
              primary
              halfWidth
            />
            <Button
              type="submit"
              onClick={() => generatePrivateKey()}
              label={t("generate_keys.actions.derive_keys")}
              halfWidth
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

export default KeyManager;
