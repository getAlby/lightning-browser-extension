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
import api from "~/common/lib/api";
import { default as nostr, default as nostrlib } from "~/common/lib/nostr";

function NostrSettings() {
  const account = useAccount();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view",
  });
  const navigate = useNavigate();
  const [hasMnemonic, setHasMnemonic] = useState(false);
  const [currentPrivateKey, setCurrentPrivateKey] = useState("");
  const [nostrPrivateKey, setNostrPrivateKey] = useState("");
  const [nostrPrivateKeyVisible, setNostrPrivateKeyVisible] = useState(false);
  const [nostrPublicKey, setNostrPublicKey] = useState("");
  const [hasImportedNostrKey, setHasImportedNostrKey] = useState(false);
  const { id } = useParams() as { id: string };

  const fetchData = useCallback(async () => {
    if (id) {
      const priv = await api.nostr.getPrivateKey(id);
      if (priv) {
        setCurrentPrivateKey(priv);
        setNostrPrivateKey(priv);
      }
      const accountResponse = await api.getAccount(id);
      setHasMnemonic(accountResponse.hasMnemonic);
      setHasImportedNostrKey(accountResponse.hasImportedNostrKey);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    try {
      // TODO: is there a way this can be moved to the background script and use the Nostr object?
      // NOTE: it is done this way to show the user the new public key before saving
      setNostrPublicKey(
        nostrPrivateKey
          ? nostr.derivePublicKey(nostr.normalizeToHex(nostrPrivateKey))
          : ""
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
  }, [nostrPrivateKey, t]);

  function onCancel() {
    // go to account settings
    navigate(`/accounts/${id}`);
  }

  async function handleDeriveNostrKeyFromSecretKey() {
    if (!hasMnemonic) {
      throw new Error("No mnemonic exists");
    }

    const derivedNostrPrivateKey = await api.nostr.generatePrivateKey(id);
    setNostrPrivateKey(derivedNostrPrivateKey);
  }

  // TODO: simplify this method - would be good to have a dedicated "remove nostr key" button
  async function handleSaveNostrPrivateKey() {
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
      if (nostrPrivateKey) {
        await api.nostr.setPrivateKey(id, nostrPrivateKey);
      } else {
        await api.nostr.removePrivateKey(id);
      }

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
          handleSaveNostrPrivateKey();
        }}
      >
        <Container maxWidth="sm">
          <div className="mt-12 shadow bg-white sm:rounded-md sm:overflow-hidden p-10 divide-black/10 dark:divide-white/10 dark:bg-surface-02dp flex flex-col gap-4">
            <div>
              <h1 className="font-bold text-2xl dark:text-white">
                {t("nostr.settings.title")}
              </h1>
              <p className="text-gray-500 dark:text-neutral-500">
                {t("nostr.settings.description")}
              </p>
            </div>

            {hasMnemonic &&
            currentPrivateKey &&
            nostrPrivateKey === currentPrivateKey ? (
              hasImportedNostrKey ? (
                <Alert type="warn">
                  {t("nostr.settings.imported_key_warning")}
                </Alert>
              ) : (
                <Alert type="info">{t("nostr.settings.can_restore")}</Alert>
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
              {hasImportedNostrKey && nostrPrivateKey === currentPrivateKey && (
                <div className="mt-4">
                  {hasMnemonic ? (
                    <Button
                      outline
                      label={t("nostr.settings.derive")}
                      onClick={handleDeriveNostrKeyFromSecretKey}
                    />
                  ) : (
                    <Alert type="warn">
                      <Trans
                        i18nKey={"nostr.settings.no_secret_key"}
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

export default NostrSettings;
