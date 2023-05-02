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
import {
  NostrKeyOrigin,
  getNostrKeyOrigin,
} from "~/app/utils/getNostrKeyOrigin";
import { saveNostrPrivateKey } from "~/app/utils/saveNostrPrivateKey";
import { deriveNostrPrivateKey } from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";
import { default as nostr, default as nostrlib } from "~/common/lib/nostr";

function NostrAdvancedSettings() {
  const account = useAccount();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });
  // TODO: add hooks useMnemonic, useNostrPrivateKey, ...
  const [mnemonic, setMnemonic] = useState("");
  const [currentPrivateKey, setCurrentPrivateKey] = useState("");
  const [nostrPrivateKey, setNostrPrivateKey] = useState("");
  const [nostrPrivateKeyVisible, setNostrPrivateKeyVisible] = useState(false);
  const [nostrPublicKey, setNostrPublicKey] = useState("");
  const [nostrKeyOrigin, setNostrKeyOrigin] =
    useState<NostrKeyOrigin>("unknown");
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const priv = (await msg.request("nostr/getPrivateKey", {
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
          const keyOrigin = await getNostrKeyOrigin(priv, accountMnemonic);
          setNostrKeyOrigin(keyOrigin);
        }
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    try {
      setNostrPublicKey(
        currentPrivateKey ? nostr.generatePublicKey(currentPrivateKey) : ""
      );
      setNostrPrivateKey(
        currentPrivateKey ? nostrlib.hexToNip19(currentPrivateKey, "nsec") : ""
      );
    } catch (e) {
      if (e instanceof Error)
        toast.error(
          <p>
            {t("nostr.errors.failed_to_load")}
            <br />
            {e.message}
          </p>
        );
    }
  }, [currentPrivateKey, t]);

  function onCancel() {
    history.back();
  }

  async function handleDeriveNostrKeyFromSecretKey() {
    if (!id) {
      throw new Error("No id set");
    }

    if (!mnemonic) {
      throw new Error("No mnemonic exists");
    }

    const nostrPrivateKey = await deriveNostrPrivateKey(mnemonic);

    await handleSaveNostrPrivateKey(nostrPrivateKey);
  }

  async function handleSaveNostrPrivateKey(nostrPrivateKey: string) {
    if (!id) {
      throw new Error("No id set");
    }
    if (nostrPrivateKey === currentPrivateKey) {
      throw new Error("private key hasn't changed");
    }

    if (
      currentPrivateKey &&
      prompt(t("nostr.private_key.warning"))?.toLowerCase() !==
        account?.account?.name?.toLowerCase()
    ) {
      toast.error(t("nostr.private_key.failed_to_remove"));
      return;
    }

    try {
      saveNostrPrivateKey(id, nostrPrivateKey);
      toast.success(
        t(
          nostrPrivateKey
            ? "nostr.private_key.success"
            : "nostr.private_key.successfully_removed"
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
          handleSaveNostrPrivateKey(nostrPrivateKey);
        }}
      >
        <Container maxWidth="sm">
          <div className="mt-12 shadow bg-white sm:rounded-md sm:overflow-hidden p-10 divide-black/10 dark:divide-white/10 dark:bg-surface-02dp flex flex-col gap-4">
            <h1 className="font-bold text-2xl dark:text-white">
              {t("nostr.advanced_settings.title")}
            </h1>
            <p className="text-gray-500 dark:text-neutral-500 -mt-4 mb-4">
              {t("nostr.advanced_settings.description")}
            </p>

            {currentPrivateKey && nostrKeyOrigin !== "secret-key" ? (
              // TODO: extract to Alert component
              <div className="rounded-md font-medium p-4 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
                <p>
                  {t(
                    nostrKeyOrigin === "unknown"
                      ? "nostr.advanced_settings.imported_key_warning"
                      : "nostr.advanced_settings.legacy_derived_key_warning"
                  )}
                </p>
              </div>
            ) : nostrKeyOrigin === "secret-key" ? (
              // TODO: extract to Alert component
              <div className="rounded-md font-medium p-4 text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900">
                <p>{t("nostr.advanced_settings.can_restore")}</p>
              </div>
            ) : null}
            <TextField
              id="nostrPrivateKey"
              label={t("nostr.private_key.label")}
              type={nostrPrivateKeyVisible ? "text" : "password"}
              value={nostrPrivateKey}
              onChange={(event) => {
                setNostrPrivateKey(event.target.value.trim());
              }}
              endAdornment={
                <div className="flex items-center gap-1 px-2">
                  <button
                    type="button"
                    tabIndex={-1}
                    className="flex justify-center items-center h-8"
                    onClick={() => {
                      setNostrPrivateKeyVisible(!nostrPrivateKeyVisible);
                    }}
                  >
                    {nostrPrivateKeyVisible ? (
                      <HiddenIcon className="h-6 w-6" />
                    ) : (
                      <VisibleIcon className="h-6 w-6" />
                    )}
                  </button>
                  <InputCopyButton value={nostrPrivateKey} className="w-6" />
                </div>
              }
            />

            <TextField
              id="nostrPublicKey"
              label={t("nostr.public_key.label")}
              type="text"
              value={nostrPublicKey}
              disabled
              endAdornment={<InputCopyButton value={nostrPublicKey} />}
            />
            {nostrKeyOrigin !== "secret-key" &&
              (mnemonic || !currentPrivateKey) && (
                <div className="mt-4">
                  {mnemonic ? (
                    <Button
                      outline
                      label={t("nostr.advanced_settings.derive")}
                      onClick={handleDeriveNostrKeyFromSecretKey}
                    />
                  ) : (
                    // TODO: extract to Alert component
                    <div className="rounded-md font-medium p-4 text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900">
                      <p>
                        <Trans
                          i18nKey={"nostr.advanced_settings.no_secret_key"}
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
          <div className="flex justify-center mt-8 mb-16 gap-4">
            <Button label={tCommon("actions.cancel")} onClick={onCancel} />
            <Button
              type="submit"
              label={tCommon("actions.save")}
              disabled={
                nostrlib.normalizeToHex(nostrPrivateKey) === currentPrivateKey
              }
              primary
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default NostrAdvancedSettings;
