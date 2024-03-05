import Container from "@components/Container";
import Loading from "@components/Loading";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "~/app/components/Alert";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import toast from "~/app/components/Toast";
import MnemonicInputs from "~/app/components/mnemonic/MnemonicInputs";
import api from "~/common/lib/api";

function ImportMnemonic() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  const [mnemonic, setMnemonic] = useState<string>("");
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [hasNostrPrivateKey, setHasNostrPrivateKey] = useState(false);

  const { id } = useParams() as { id: string };

  useEffect(() => {
    (async () => {
      try {
        const account = await api.getAccount(id);
        setHasNostrPrivateKey(account.nostrEnabled);
        setHasFetchedData(true);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
      }
    })();
  }, [id, navigate]);

  async function importKey() {
    try {
      if (
        mnemonic.split(" ").length !== 12 ||
        !bip39.validateMnemonic(mnemonic, wordlist)
      ) {
        throw new Error("Invalid mnemonic");
      }

      await api.setMnemonic(id, mnemonic);
      await api.editAccount(id, {
        useMnemonicForLnurlAuth: true,
        isMnemonicBackupDone: true,
      });
      toast.success(t("saved"));
      // go to account settings
      navigate(`/accounts/${id}`);
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  }

  return !hasFetchedData ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <Container maxWidth="md">
        <ContentBox>
          <h1 className="font-bold text-2xl dark:text-white">
            {t("import.title")}
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">
            {t("import.description")}
          </p>
          {hasNostrPrivateKey && (
            <Alert type="info">{t("existing_nostr_key_notice")}</Alert>
          )}
          <MnemonicInputs mnemonic={mnemonic} setMnemonic={setMnemonic} />

          <div className="flex justify-center">
            <Button label={t("import.button")} primary onClick={importKey} />
          </div>
        </ContentBox>
      </Container>
    </div>
  );
}

export default ImportMnemonic;
