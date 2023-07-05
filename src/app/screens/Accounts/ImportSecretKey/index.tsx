import AccountDetailHeader from "@components/AccountDetailHeader";
import Container from "@components/Container";
import Loading from "@components/Loading";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Alert from "~/app/components/Alert";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import MnemonicInputs from "~/app/components/mnemonic/MnemonicInputs";
import api, { GetAccountRes } from "~/common/lib/api";

function ImportSecretKey() {
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  const [mnemonic, setMnemonic] = useState<string>("");
  const [account, setAccount] = useState<GetAccountRes>();
  const [loading, setLoading] = useState<boolean>(true);
  const [hasNostrPrivateKey, setHasNostrPrivateKey] = useState(false);

  const { id } = useParams() as { id: string };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const account = await api.getAccount(id);
        setAccount(account);
        setHasNostrPrivateKey(account.nostrEnabled);
        if (account.hasMnemonic) {
          // do not allow user to import a mnemonic if they already have one for the current account
          // go to account settings
          navigate(`/accounts/${id}`);
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  function cancelImport() {
    // go to account settings
    navigate(`/accounts/${id}`);
  }

  async function importKey() {
    try {
      if (
        mnemonic.split(" ").length !== 12 ||
        !bip39.validateMnemonic(mnemonic, wordlist)
      ) {
        throw new Error("Invalid mnemonic");
      }

      await api.setMnemonic(id, mnemonic);
      toast.success(t("saved"));
      // go to account settings
      navigate(`/accounts/${id}`);
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  }

  return loading ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      {account && <AccountDetailHeader account={account} />}

      <Container>
        <ContentBox>
          <h1 className="font-bold text-2xl dark:text-white">
            {t("import.title")}
          </h1>
          <p className="text-gray-500 dark:text-neutral-500 -mt-2 mb-4">
            {t("import.description")}
          </p>

          <MnemonicInputs mnemonic={mnemonic} setMnemonic={setMnemonic} />
          {hasNostrPrivateKey && (
            <Alert type="warn">{t("existing_nostr_key_notice")}</Alert>
          )}
        </ContentBox>

        <div className="flex justify-center mt-8 mb-16 gap-4">
          <Button label={tCommon("actions.cancel")} onClick={cancelImport} />
          <Button label={t("import.button")} primary onClick={importKey} />
        </div>
      </Container>
    </div>
  );
}

export default ImportSecretKey;
