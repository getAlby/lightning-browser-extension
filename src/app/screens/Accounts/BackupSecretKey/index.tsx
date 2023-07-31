import Container from "@components/Container";
import Loading from "@components/Loading";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import MnemonicInputs from "~/app/components/mnemonic/MnemonicInputs";
import SecretKeyDescription from "~/app/components/mnemonic/SecretKeyDescription";
import api from "~/common/lib/api";

function BackupSecretKey() {
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
          <SecretKeyDescription />
          <MnemonicInputs mnemonic={mnemonic} readOnly />
        </ContentBox>
        <div className="flex justify-center mt-8 mb-16 gap-4">
          <Button
            label={tCommon("actions.back")}
            onClick={() => navigate(-1)}
          />
        </div>
      </Container>
    </div>
  );
}

export default BackupSecretKey;
