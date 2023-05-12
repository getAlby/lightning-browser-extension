import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Container from "@components/Container";
import Loading from "@components/Loading";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import MnemonicInputs from "~/app/components/MnemonicInputs";
import { useAccount } from "~/app/context/AccountContext";
import { saveMnemonic } from "~/app/utils/saveMnemonic";
import msg from "~/common/lib/msg";

function ImportSecretKey() {
  const [mnemonic, setMnemonic] = useState<string>("");
  const account = useAccount();
  const { t: tCommon } = useTranslation("common");
  const [importPasteLabel, setImportPasteLabel] = useState(
    tCommon("actions.paste_clipboard") as string
  );
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  // TODO: useMnemonic hook
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [hasMnemonic, setHasMnemonic] = useState(false);
  // TODO: useNostrPrivateKey hook
  const [currentPrivateKey, setCurrentPrivateKey] = useState("");
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
          setHasMnemonic(true);
        }
        setHasFetchedData(true);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function cancelImport() {
    history.back();
  }

  async function importKey() {
    try {
      if (hasMnemonic) {
        if (!window.confirm(t("import.confirm_overwrite"))) {
          return;
        }
      }
      if (!account || !id) {
        // type guard
        throw new Error("No account available");
      }

      if (
        mnemonic.split(" ").length !== 12 ||
        !bip39.validateMnemonic(mnemonic, wordlist)
      ) {
        console.error("Invalid mnemonic: '" + mnemonic + "'");
        throw new Error("Invalid mnemonic");
      }

      await saveMnemonic(id, mnemonic);
      toast.success(t("saved"));
      history.back();
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  }

  return !account || !hasFetchedData ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <Container>
        <div className="mt-12 shadow bg-white sm:rounded-md sm:overflow-hidden p-10 divide-black/10 dark:divide-white/10 dark:bg-surface-02dp flex flex-col gap-4">
          <h1 className="font-bold text-2xl dark:text-white">
            {t("import.title")}
          </h1>
          <p className="text-gray-500 dark:text-neutral-500 -mt-4 mb-4">
            {t("import.description")}
          </p>

          <MnemonicInputs mnemonic={mnemonic} setMnemonic={setMnemonic}>
            <>
              <Button
                outline
                icon={<CopyIcon className="w-6 h-6 mr-2 text-orange-400" />}
                label={importPasteLabel}
                onClick={async () => {
                  try {
                    setMnemonic(await navigator.clipboard.readText());
                    setImportPasteLabel(tCommon("pasted"));
                    setTimeout(() => {
                      setImportPasteLabel(tCommon("actions.paste_clipboard"));
                    }, 1000);
                  } catch (e) {
                    if (e instanceof Error) {
                      toast.error(e.message);
                    }
                  }
                }}
              />
            </>
          </MnemonicInputs>
          {currentPrivateKey && (
            <div className="rounded-md font-medium p-4 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
              {t("existing_nostr_key_notice")}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8 mb-16 gap-4">
          <Button label={tCommon("actions.cancel")} onClick={cancelImport} />
          <Button label={t("import.button")} primary onClick={importKey} />
        </div>
      </Container>
    </div>
  );
}

export default ImportSecretKey;
