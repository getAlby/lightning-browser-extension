import Container from "@components/Container";
import Loading from "@components/Loading";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Alert from "~/app/components/Alert";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import MnemonicInputs from "~/app/components/MnemonicInputs";
import SecretKeyDescription from "~/app/components/SecretKeyDescription";
import Checkbox from "~/app/components/form/Checkbox";
import { useAccount } from "~/app/context/AccountContext";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";

function GenerateSecretKey() {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState<string | undefined>();
  const account = useAccount();
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });
  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);
  useState(false);
  const [hasNostrPrivateKey, setHasNostrPrivateKey] = useState(false);

  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      const account = await api.getAccount();
      setHasNostrPrivateKey(account.nostrEnabled);
      const newMnemonic = (await msg.request("generateMnemonic")) as string;
      setMnemonic(newMnemonic);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function saveGeneratedSecretKey() {
    try {
      if (!hasConfirmedBackup) {
        throw new Error(t("backup.error_confirm"));
      }
      if (!account || !id) {
        // type guard
        throw new Error("No account available");
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

  return !account || !mnemonic ? (
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
