import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Container from "@components/Container";
import Loading from "@components/Loading";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
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

// import { GetAccountRes } from "~/common/lib/api";

function NostrAdvancedSettings() {
  const account = useAccount();
  //const [account, setAccount] = useState<GetAccountRes | null>(null);
  const { t: tCommon } = useTranslation("common");
  // TODO: move these translations to the correct place
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
      toast.error("You haven't setup your secret key yet");
      return;
    }

    const nostrPrivateKey = await deriveNostrPrivateKey(mnemonic);

    await handleSaveNostrPrivateKey(nostrPrivateKey);
  }

  async function handleSaveNostrPrivateKey(nostrPrivateKey: string) {
    if (!id) {
      throw new Error("No id set");
    }
    if (nostrPrivateKey === currentPrivateKey) {
      toast.error("Your private key hasn't changed");
      return;
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
            <h1 className="font-bold text-2xl">
              {/*{t("nostr.generate_keys.title")}*/}Advanced Nostr Settings
            </h1>
            <p className="text-gray-500">
              {/*{t("nostr.generate_keys.title")}*/}Derive Nostr keys from your
              Secret Key or import your existing private key by pasting it in
              “Nostr Private Key” field.
            </p>

            {currentPrivateKey && nostrKeyOrigin !== "secret-key" ? (
              <div className="rounded-md font-medium p-4 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
                {/*t("nostr.private_key.backup")*/}
                {nostrKeyOrigin === "unknown"
                  ? "⚠️ You’re currently using an imported or randomly generated Nostr key which cannot be restored by your Secret Key, so remember to back up your Nostr private key."
                  : "⚠️ You’re currently using a Nostr key derived from your account (legacy) which cannot be restored by your Secret Key, so remember to back up your Nostr private key."}
              </div>
            ) : nostrKeyOrigin === "secret-key" ? (
              <div className="rounded-md font-medium p-4 text-green-700 bg-orange-50 dark:text-green-400 dark:bg-green-900">
                {/*t("nostr.private_key.backup")*/}
                {"✅ Nostr key derived from your secret key"}
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
            {nostrKeyOrigin !== "secret-key" && (
              <div className="mt-4">
                <Button
                  outline
                  label="Derive Nostr keys from your Secret Key"
                  onClick={handleDeriveNostrKeyFromSecretKey}
                />
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
