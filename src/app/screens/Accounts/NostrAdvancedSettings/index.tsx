import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Container from "@components/Container";
import Loading from "@components/Loading";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Alert from "~/app/components/Alert";
import Button from "~/app/components/Button";
import InputCopyButton from "~/app/components/InputCopyButton";
import TextField from "~/app/components/form/TextField";
import { useAccount } from "~/app/context/AccountContext";
import { saveNostrPrivateKey } from "~/app/utils/saveNostrPrivateKey";
import { GetAccountRes } from "~/common/lib/api";
import { deriveNostrPrivateKey } from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";
import { default as nostr, default as nostrlib } from "~/common/lib/nostr";

function NostrAdvancedSettings() {
  const account = useAccount();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });
  const navigate = useNavigate();
  // FIXME: use account hasMnemonic
  const [mnemonic, setMnemonic] = useState("");
  const [currentPrivateKey, setCurrentPrivateKey] = useState("");
  const [nostrPrivateKey, setNostrPrivateKey] = useState("");
  const [nostrPrivateKeyVisible, setNostrPrivateKeyVisible] = useState(false);
  const [nostrPublicKey, setNostrPublicKey] = useState("");
  const [hasImportedNostrKey, setHasImportedNostrKey] = useState(false);
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    if (id) {
      const priv = (await msg.request("nostr/getPrivateKey", {
        id,
      })) as string;
      if (priv) {
        setCurrentPrivateKey(priv);
      }

      // FIXME: do not get mnemonic here
      const accountMnemonic = (await msg.request("getMnemonic", {
        id,
      })) as string;
      if (accountMnemonic) {
        setMnemonic(accountMnemonic);
      }

      const accountResponse = await msg.request<GetAccountRes>("getAccount", {
        id,
      });
      setHasImportedNostrKey(accountResponse.hasImportedNostrKey);
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
    // go to account settings
    navigate(`/accounts/${id}`);
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
    // go to account settings
    navigate(`/accounts/${id}`);
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
            <div>
              <h1 className="font-bold text-2xl dark:text-white">
                {t("nostr.advanced_settings.title")}
              </h1>
              <p className="text-gray-500 dark:text-neutral-500">
                {t("nostr.advanced_settings.description")}
              </p>
            </div>

            {mnemonic && currentPrivateKey ? (
              hasImportedNostrKey ? (
                <Alert type="warn">
                  {t("nostr.advanced_settings.imported_key_warning")}
                </Alert>
              ) : (
                <Alert type="info">
                  {t("nostr.advanced_settings.can_restore")}
                </Alert>
              )
            ) : null}

            <div>
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
            </div>

            <div>
              <TextField
                id="nostrPublicKey"
                label={t("nostr.public_key.label")}
                type="text"
                value={nostrPublicKey}
                disabled
                endAdornment={<InputCopyButton value={nostrPublicKey} />}
              />
              {hasImportedNostrKey && (
                <div className="mt-4">
                  {mnemonic ? (
                    <Button
                      outline
                      label={t("nostr.advanced_settings.derive")}
                      onClick={handleDeriveNostrKeyFromSecretKey}
                    />
                  ) : (
                    <Alert type="warn">
                      <Trans
                        i18nKey={"nostr.advanced_settings.no_secret_key"}
                        t={t}
                        components={[
                          // eslint-disable-next-line react/jsx-key
                          <Link
                            to="../secret-key/generate"
                            relative="path"
                            className="underline"
                          />,
                        ]}
                      />
                    </Alert>
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
