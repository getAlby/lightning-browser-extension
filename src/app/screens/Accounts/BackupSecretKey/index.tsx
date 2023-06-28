import Container from "@components/Container";
import Loading from "@components/Loading";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ContentBox } from "~/app/components/ContentBox";
import MnemonicInputs from "~/app/components/mnemonic/MnemonicInputs";
import SecretKeyDescription from "~/app/components/mnemonic/SecretKeyDescription";
import msg from "~/common/lib/msg";

function BackupSecretKey() {
  const [mnemonic, setMnemonic] = useState<string | undefined>();
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      const accountMnemonic = (await msg.request("getMnemonic", {
        id,
      })) as string;

      setMnemonic(accountMnemonic);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return !mnemonic ? (
    <div className="flex justify-center mt-5">
      <Loading />
    </div>
  ) : (
    <div>
      <Container>
        <ContentBox>
          <h1 className="font-bold text-2xl dark:text-white">
            {t("backup.title")}
          </h1>
          <SecretKeyDescription />

          <MnemonicInputs mnemonic={mnemonic} readOnly />
        </ContentBox>
      </Container>
    </div>
  );
}

export default BackupSecretKey;
