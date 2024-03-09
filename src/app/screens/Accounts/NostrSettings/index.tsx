import Container from "@components/Container";
import Loading from "@components/Loading";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "~/app/components/Alert";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import InputCopyButton from "~/app/components/InputCopyButton";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import toast from "~/app/components/Toast";
import TextField from "~/app/components/form/TextField";
import api, { GetAccountRes } from "~/common/lib/api";
import { default as nostr } from "~/common/lib/nostr";

function NostrSettings() {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "wallets.wallet_view",
  });
  const navigate = useNavigate();
  const [hasMnemonic, setHasMnemonic] = useState(false);
  const [currentPrivateKey, setCurrentPrivateKey] = useState("");
  const [nostrPrivateKey, setNostrPrivateKey] = useState("");
  const [nostrPrivateKeyVisible, setNostrPrivateKeyVisible] = useState(false);
  const [nostrPublicKey, setNostrPublicKey] = useState("");
  const [hasImportedNostrKey, setHasImportedNostrKey] = useState(false);
  const [account, setAccount] = useState<GetAccountRes>();
  const { id } = useParams() as { id: string };

  const fetchData = useCallback(async () => {
    if (id) {
      const priv = await api.nostr.getPrivateKey(id);
      if (priv) {
        setCurrentPrivateKey(priv);
        const nsec = nostr.hexToNip19(priv);
        setNostrPrivateKey(nsec);
      }
      const accountResponse = await api.getAccount(id);
      setHasMnemonic(accountResponse.hasMnemonic);
      setHasImportedNostrKey(accountResponse.hasImportedNostrKey);
      setAccount(accountResponse);
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
      console.error(e);
    }
  }, [nostrPrivateKey, t]);

  function onCancel() {
    // go to account settings
    navigate(`/accounts/${id}`);
  }

  function handleDeleteKeys() {
    setNostrPrivateKey("");
  }

  async function handleDeriveNostrKeyFromSecretKey() {
    if (!hasMnemonic) {
      throw new Error("No mnemonic exists");
    }

    const derivedNostrPrivateKey = await api.nostr.generatePrivateKey(id);
    setNostrPrivateKey(nostr.hexToNip19(derivedNostrPrivateKey));
  }

  // TODO: simplify this method - would be good to have a dedicated "remove nostr key" button
  async function handleSaveNostrPrivateKey() {
    if (
      currentPrivateKey &&
      prompt(
        t("nostr.private_key.warning", { name: account?.name })
      )?.toLowerCase() !== account?.name?.toLowerCase()
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
          <ContentBox>
            <div>
              <h1 className="font-bold text-2xl dark:text-white">
                {t("nostr.settings.title")}
              </h1>
              <p className="text-gray-500 dark:text-neutral-500">
                {t("nostr.settings.description")}
              </p>
            </div>

            {!hasMnemonic && !nostrPrivateKey && (
              <Alert type="info">
                <Trans
                  i18nKey={"nostr.settings.no_secret_key"}
                  t={t}
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <Link
                      to="../../secret-key/new"
                      relative="path"
                      className="underline"
                    />,
                  ]}
                />
              </Alert>
            )}

            {hasMnemonic && currentPrivateKey ? (
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
                autoComplete="new-password"
                type={nostrPrivateKeyVisible ? "text" : "password"}
                value={nostrPrivateKey}
                onChange={(event) => {
                  setNostrPrivateKey(event.target.value.trim());
                }}
                endAdornment={
                  <div className="flex items-center gap-1 px-2">
                    <PasswordViewAdornment
                      onChange={(passwordView) => {
                        setNostrPrivateKeyVisible(passwordView);
                      }}
                    />
                    <InputCopyButton value={nostrPrivateKey} className="w-6" />
                  </div>
                }
              />
            </div>

            <div>
              <TextField
                id="nostrPublicKey"
                label={t("nostr.public_key.label")}
                value={nostrPublicKey}
                disabled
                endAdornment={<InputCopyButton value={nostrPublicKey} />}
              />
              <div className="mt-4 flex gap-4 items-center justify-center">
                {nostrPrivateKey && (
                  <Button
                    error
                    label={t("nostr.settings.remove")}
                    onClick={handleDeleteKeys}
                  />
                )}
                {hasImportedNostrKey && hasMnemonic && (
                  <Button
                    outline
                    label={t("nostr.settings.derive")}
                    onClick={handleDeriveNostrKeyFromSecretKey}
                  />
                )}
              </div>
            </div>
          </ContentBox>
          <div className="flex justify-center my-6 gap-4">
            <Button label={tCommon("actions.cancel")} onClick={onCancel} />
            <Button type="submit" label={tCommon("actions.save")} primary />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default NostrSettings;
