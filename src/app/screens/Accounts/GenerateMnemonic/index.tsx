import Container from "@components/Container";
import Loading from "@components/Loading";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "~/app/components/Alert";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import toast from "~/app/components/Toast";
import MnemonicInstructions from "~/app/components/mnemonic/MnemonicBackupDescription";
import MnemonicInputs from "~/app/components/mnemonic/MnemonicInputs";
import api from "~/common/lib/api";

function GenerateMnemonic() {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);
  const [hasNostrPrivateKey, setHasNostrPrivateKey] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        const account = await api.getAccount(id);
        setHasNostrPrivateKey(account.nostrEnabled);
        if (account.hasMnemonic) {
          // do not allow user to generate a mnemonic if they already have one for the current account
          // go to account settings
          navigate(`/accounts/${id}`);
        }
        const newMnemonic = await api.generateMnemonic();
        setMnemonic(newMnemonic);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
      }
    })();
  }, [id, navigate]);

  async function saveGeneratedSecretKey() {
    try {
      if (!hasConfirmedBackup) {
        throw new Error(t("error_confirm"));
      }
      if (!mnemonic) {
        throw new Error("No mnemonic available");
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

  return !mnemonic ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <Container maxWidth="md">
        <ContentBox>
          <h1 className="font-bold text-2xl dark:text-white">
            {t("generate.title")}
          </h1>

          <MnemonicInstructions />
          {hasNostrPrivateKey && (
            <Alert type="info">{t("existing_nostr_key_notice")}</Alert>
          )}
          <MnemonicInputs
            mnemonic={mnemonic}
            readOnly
            isConfirmed={(hasConfirmedBackup) => {
              setHasConfirmedBackup(hasConfirmedBackup);
            }}
          ></MnemonicInputs>
          <div className="flex justify-center">
            <Button
              label={t("backup.save")}
              primary
              onClick={saveGeneratedSecretKey}
            />
          </div>
        </ContentBox>
      </Container>
    </div>
  );
}

export default GenerateMnemonic;
