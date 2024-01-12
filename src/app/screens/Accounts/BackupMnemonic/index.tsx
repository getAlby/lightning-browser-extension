import Container from "@components/Container";
import Loading from "@components/Loading";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import toast from "~/app/components/Toast";
import MnemonicBackupDescription from "~/app/components/mnemonic/MnemonicBackupDescription";
import MnemonicInputs from "~/app/components/mnemonic/MnemonicInputs";
import api from "~/common/lib/api";

function BackupMnemonic() {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });
  const navigate = useNavigate();

  const [mnemonic, setMnemonic] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const accountMnemonic = await api.getMnemonic(id as string);
      setMnemonic(accountMnemonic);
      setLoading(false);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return loading ? (
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
          <MnemonicBackupDescription />
          <MnemonicInputs mnemonic={mnemonic} readOnly />

          <div className="flex justify-center mt-6 w-64 mx-auto">
            <Button
              label={tCommon("actions.finish")}
              primary
              flex
              onClick={() => navigate(-1)}
            />
          </div>
        </ContentBox>
      </Container>
    </div>
  );
}

export default BackupMnemonic;
