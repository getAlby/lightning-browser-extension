import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Container from "@components/Container";
import Loading from "@components/Loading";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import InputCopyButton from "~/app/components/InputCopyButton";
import TextField from "~/app/components/form/TextField";
import { useAccount } from "~/app/context/AccountContext";
import { KeyOrigin, getKeyOrigin } from "~/app/utils/getKeyOrigin";
import { savePrivateKey } from "~/app/utils/savePrivateKey";
import { default as liquid } from "~/common/lib/liquid";
import {
  deriveLiquidPrivateKey,
  deriveNostrPrivateKey,
} from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";
import { default as nostr, default as nostrlib } from "~/common/lib/nostr";

function AdvancedKeySettings({ type }: { type: "nostr" | "liquid" }) {
  const account = useAccount();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: `accounts.account_view.${type}`,
  });
  // TODO: add hooks useMnemonic, useNostrPrivateKey, ...
  const [mnemonic, setMnemonic] = useState("");
  const [currentPrivateKey, setCurrentPrivateKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [keyOrigin, setKeyOrigin] = useState<KeyOrigin>("unknown");
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const priv = (await msg.request(`${type}/getPrivateKey`, {
          id,
        })) as string;
        if (priv) {
          setCurrentPrivateKey(priv);
        }

        const accountMnemonic = (await msg.request("getMnemonic", {
          id,
        })) as string;
        if (accountMnemonic) {
          setMnemonic(accountMnemonic);
        }

        if (priv) {
          const keyOrigin = await getKeyOrigin(type, priv, accountMnemonic);
          setKeyOrigin(keyOrigin);
        }
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    try {
      setPublicKey(
        currentPrivateKey
          ? type === "nostr"
            ? nostr.generatePublicKey(currentPrivateKey)
            : liquid.generatePublicKey(currentPrivateKey)
          : ""
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
            {t("errors.failed_to_load")}
            <br />
            {e.message}
          </p>
        );
    }
  }, [currentPrivateKey, t, type]);

  function onCancel() {
    history.back();
  }

  async function handleDeriveKeyFromSecretKey() {
    if (!id) {
      throw new Error("No id set");
    }

    if (!mnemonic) {
      throw new Error("No mnemonic exists");
    }

    const privateKey =
      type === "nostr"
        ? await deriveNostrPrivateKey(mnemonic)
        : await deriveLiquidPrivateKey(mnemonic);

    await handleSavePrivateKey(privateKey);
  }

  async function handleSavePrivateKey(privateKey: string) {
    if (!id) {
      throw new Error("No id set");
    }
    if (privateKey === currentPrivateKey) {
      throw new Error("private key hasn't changed");
    }

    if (
      currentPrivateKey &&
      prompt(t("private_key.warning"))?.toLowerCase() !==
        account?.account?.name?.toLowerCase()
    ) {
      toast.error(t("private_key.failed_to_remove"));
      return;
    }

    try {
      savePrivateKey(type, id, privateKey);
      toast.success(
        t(
          privateKey
            ? "private_key.success"
            : "private_key.successfully_removed"
        )
      );
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
    history.back();
  }

  return !account ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          handleSavePrivateKey(privateKey);
        }}
      >
        <Container maxWidth="sm">
          <div className="mt-12 shadow bg-white sm:rounded-md sm:overflow-hidden p-10 divide-black/10 dark:divide-white/10 dark:bg-surface-02dp flex flex-col gap-4">
            <div>
              <h1 className="font-bold text-2xl dark:text-white">
                {t("advanced_settings.title")}
              </h1>
              <p className="text-gray-500 dark:text-neutral-500">
                {t("advanced_settings.description")}
              </p>
            </div>

            {currentPrivateKey && keyOrigin !== "secret-key" ? (
              // TODO: extract to Alert component
              <div className="rounded-md font-medium p-4 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
                <p>
                  {t(
                    keyOrigin === "unknown"
                      ? "advanced_settings.imported_key_warning"
                      : "advanced_settings.legacy_derived_key_warning"
                  )}
                </p>
              </div>
            ) : keyOrigin === "secret-key" ? (
              // TODO: extract to Alert component
              <div className="rounded-md font-medium p-4 text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900">
                <p>{t("advanced_settings.can_restore")}</p>
              </div>
            ) : null}

            <div>
              <TextField
                id="privateKey"
                label={t("private_key.label")}
                type={privateKeyVisible ? "text" : "password"}
                value={privateKey}
                onChange={(event) => {
                  setPrivateKey(event.target.value.trim());
                }}
                endAdornment={
                  <div className="flex items-center gap-1 px-2">
                    <button
                      type="button"
                      tabIndex={-1}
                      className="flex justify-center items-center h-8"
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
                    <InputCopyButton value={privateKey} className="w-6" />
                  </div>
                }
              />
            </div>

            <div>
              <TextField
                id="publicKey"
                label={t("public_key.label")}
                type="text"
                value={publicKey}
                disabled
                endAdornment={<InputCopyButton value={publicKey} />}
              />
              {keyOrigin !== "secret-key" &&
                (mnemonic || !currentPrivateKey) && (
                  <div className="mt-4">
                    {mnemonic ? (
                      <Button
                        outline
                        label={t("advanced_settings.derive")}
                        onClick={handleDeriveKeyFromSecretKey}
                      />
                    ) : (
                      // TODO: extract to Alert component
                      <div className="rounded-md font-medium p-4 text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900">
                        <p>
                          <Trans
                            i18nKey={"advanced_settings.no_secret_key"}
                            t={t}
                            components={[
                              // eslint-disable-next-line react/jsx-key
                              <Link
                                to="../secret-key/backup"
                                relative="path"
                                className="underline"
                              />,
                            ]}
                          />
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
          <div className="flex justify-center mt-8 mb-16 gap-4">
            <Button label={tCommon("actions.cancel")} onClick={onCancel} />
            <Button
              type="submit"
              label={tCommon("actions.save")}
              disabled={
                type === "nostr"
                  ? nostrlib.normalizeToHex(privateKey) === currentPrivateKey
                  : privateKey === currentPrivateKey
              }
              primary
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default AdvancedKeySettings;
