import Container from "@components/Container";
import Loading from "@components/Loading";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Alert from "~/app/components/Alert";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import Checkbox from "~/app/components/form/Checkbox";
import MnemonicInputs from "~/app/components/mnemonic/MnemonicInputs";
import SecretKeyDescription from "~/app/components/mnemonic/SecretKeyDescription";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";

function GenerateSecretKey() {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState<string | undefined>();
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });
  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);
  useState(false);
  const [hasNostrPrivateKey, setHasNostrPrivateKey] = useState(false);

  const { id } = useParams();

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
        const newMnemonic = (await msg.request("generateMnemonic")) as string;
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
        throw new Error(t("backup.error_confirm"));
      }
      if (!mnemonic) {
        throw new Error("No mnemonic available");
      }

      await msg.request("setMnemonic", {
        id,
        mnemonic,
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
      <Container>
        <ContentBox>
          <h1 className="font-bold text-2xl dark:text-white">
            {t("generate.title")}
          </h1>
          <SecretKeyDescription />
          <MnemonicInputs mnemonic={mnemonic} readOnly>
            <>
              <div className="flex items-center">
                <Checkbox
                  id="has_backed_up"
                  name="Backup confirmation checkbox"
                  checked={hasConfirmedBackup}
                  onChange={(event) => {
                    setHasConfirmedBackup(event.target.checked);
                  }}
                />
                <label
                  htmlFor="has_backed_up"
                  className="cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white"
                >
                  {t("backup.confirm")}
                </label>
              </div>
            </>
          </MnemonicInputs>
          {hasNostrPrivateKey && (
            <Alert type="warn">{t("existing_nostr_key_notice")}</Alert>
          )}
        </ContentBox>
        <div className="flex justify-center mt-8 mb-16">
          <Button
            label={t("backup.save")}
            primary
            onClick={saveGeneratedSecretKey}
          />
        </div>
      </Container>
    </div>
  );
}

export default GenerateSecretKey;
