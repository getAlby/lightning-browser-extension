import Container from "@components/Container";
import Loading from "@components/Loading";
import {
  PopiconsCircleExclamationLine,
  PopiconsExpandLine,
} from "@popicons/react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "~/app/components/Alert";
import Button from "~/app/components/Button";
import TextField from "~/app/components/form/TextField";
import InputCopyButton from "~/app/components/InputCopyButton";
import MenuDivider from "~/app/components/Menu/MenuDivider";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import toast from "~/app/components/Toast";
import { isAlbyOAuthAccount } from "~/app/utils";
import api, { GetAccountRes } from "~/common/lib/api";
import { default as nostr } from "~/common/lib/nostr";

function NostrSettings() {
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
  const [account, setAccount] = useState<GetAccountRes>();
  const { id } = useParams() as { id: string };
  const [NIP05Key, setNIP05Key] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");

  const fetchData = useCallback(async () => {
    if (id) {
      const priv = await api.nostr.getPrivateKey(id);
      const account = await api.getAccountInfo();
      if (account.info.nostr_pubkey) {
        setNIP05Key(account.info.nostr_pubkey);
      }

      if (account.info.lightning_address) {
        setLightningAddress(account.info.lightning_address);
      }
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
    <Container>
      <div className="flex flex-col gap-12 mt-12">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold dark:text-white leading-8">
            {t("nostr.settings.title")}
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold dark:text-white leading-7">
                {t("nostr.settings.nostr_keys.title")}
              </h2>

              <p className="text-gray-600 dark:text-neutral-400 text-sm leading-6">
                {t("nostr.settings.nostr_keys.description")}
              </p>
            </div>
            <div className="shadow bg-white rounded-md sm:overflow-hidden p-6 dark:bg-surface-01dp flex flex-col gap-4">
              {hasMnemonic && currentPrivateKey ? (
                hasImportedNostrKey ? (
                  <Alert type="warn">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">
                        <PopiconsCircleExclamationLine className="w-5 h-5" />
                      </div>
                      <span className="text-sm">
                        {t("nostr.settings.imported_key_warning")}
                      </span>
                    </div>
                  </Alert>
                ) : (
                  <Alert type="info">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">
                        <PopiconsCircleExclamationLine className="w-5 h-5" />
                      </div>
                      <span className="text-sm">
                        {t("nostr.settings.can_restore")}
                      </span>
                    </div>
                  </Alert>
                )
              ) : null}
              {nostrPublicKey && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="sm:w-9/12 w-full">
                      <p className="text-gray-800 dark:text-white font-medium">
                        {t("nostr.public_key.label")}
                      </p>

                      <div className="flex items-center gap-2">
                        <p className="text-gray-600 text-sm dark:text-neutral-400 text-ellipsis overflow-hidden whitespace-nowrap">
                          {nostrPublicKey}
                        </p>

                        <InputCopyButton
                          value={nostrPublicKey}
                          className="w-5 h-5"
                        />
                      </div>
                    </div>
                  </div>
                  <MenuDivider />
                </>
              )}

              <form
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  handleSaveNostrPrivateKey();
                }}
                className="flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div className="sm:w-7/12 w-full">
                  <TextField
                    id="nostrPrivateKey"
                    label={t("nostr.private_key.label")}
                    placeholder="Enter private key"
                    autoComplete="new-password"
                    type={nostrPrivateKeyVisible ? "text" : "password"}
                    value={nostrPrivateKey}
                    onChange={(event) => {
                      setNostrPrivateKey(event.target.value.trim());
                    }}
                    endAdornment={
                      <div className="flex items-center gap-1 px-4">
                        <PasswordViewAdornment
                          onChange={(passwordView) => {
                            setNostrPrivateKeyVisible(passwordView);
                          }}
                        />
                        <InputCopyButton
                          value={nostrPrivateKey}
                          className="w-6"
                        />
                      </div>
                    }
                  />
                </div>
                <div className="flex flex-col sm:flex-row w-full justify-end mt-0 sm:mt-6">
                  {hasImportedNostrKey && hasMnemonic && (
                    <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0 mr-4">
                      <Button
                        outline
                        label={t("nostr.settings.derive")}
                        onClick={handleDeriveNostrKeyFromSecretKey}
                        fullWidth
                      />
                    </div>
                  )}

                  <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                    <Button
                      type="submit"
                      label={tCommon("actions.save")}
                      primary
                      fullWidth
                    />
                  </div>
                </div>
              </form>

              {nostrPrivateKey && (
                <>
                  <MenuDivider />
                  <form
                    onSubmit={(e: FormEvent) => {
                      e.preventDefault();
                      handleSaveNostrPrivateKey();
                    }}
                    className="flex flex-col sm:flex-row justify-between items-center"
                  >
                    <div className="sm:w-7/12 w-full">
                      <p className="text-gray-800 dark:text-white font-medium">
                        {t("nostr.settings.remove_keys.title")}
                      </p>

                      <p className="text-gray-600 text-sm dark:text-neutral-400">
                        {t("nostr.settings.remove_keys.description")}
                      </p>
                    </div>

                    <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                      <Button
                        destructive
                        label={t("nostr.settings.remove")}
                        onClick={handleDeleteKeys}
                        fullWidth
                      />
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
        {isAlbyOAuthAccount(account.connectorType) && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold dark:text-white leading-7">
                {t("nostr.settings.nostr_address.title")}
              </h2>

              <p className="text-gray-600 dark:text-neutral-400 text-sm leading-6">
                {t("nostr.settings.nostr_address.description")}
              </p>
            </div>
            <div className="shadow bg-white rounded-md sm:overflow-hidden p-6 dark:bg-surface-01dp flex flex-col sm:flex-row gap-4">
              <div className="sm:w-9/12 w-full">
                <p className="text-gray-800 dark:text-white font-medium">
                  {t("nostr.settings.nostr_address.manage_nostr_address.title")}
                </p>
                <p className="text-gray-600 text-sm dark:text-neutral-400 text-ellipsis whitespace-nowrap overflow-hidden">
                  <Trans
                    i18nKey={
                      NIP05Key === ""
                        ? "nostr.settings.nostr_address.manage_nostr_address.description_alternate"
                        : "nostr.settings.nostr_address.manage_nostr_address.description"
                    }
                    t={t}
                    values={{
                      lnaddress: lightningAddress,
                      npub:
                        NIP05Key.substring(0, 11) +
                        "..." +
                        NIP05Key.substring(NIP05Key.length - 11),
                    }}
                    // eslint-disable-next-line react/jsx-key
                    components={[<b></b>]}
                  />
                </p>
              </div>

              <div className="flex-none sm:w-64 w-full pt-4 sm:pt-0">
                <div className="flex flex-row gap-2">
                  <Button
                    label={t(
                      "nostr.settings.nostr_address.manage_nostr_address.set_nip05"
                    )}
                    iconRight={<PopiconsExpandLine className="w-5 h-5" />}
                    fullWidth
                    primary
                    onClick={() =>
                      window.open(
                        "https://getalby.com/settings/nostr",
                        "_blank"
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

export default NostrSettings;
