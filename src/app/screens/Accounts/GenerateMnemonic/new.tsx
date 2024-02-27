import Container from "@components/Container";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import MnemonicDescription from "~/app/components/mnemonic/MnemonicDescription";
import { useTheme } from "~/app/utils";

function MnemonicExplanation() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams() as { id: string };

  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic.new",
  });
  const { t: tCommon } = useTranslation("common");

  function cancel() {
    // go to account settings
    navigate(`/accounts/${id}`);
  }

  return (
    <Container>
      <ContentBox>
        <h1 className="font-bold text-2xl dark:text-white">{t("title")}</h1>
        <img
          src={`assets/images/master_key_${theme}.png`}
          alt="Master Key"
          className="max-w-[412px] mx-auto w-full"
        />
        <MnemonicDescription />
      </ContentBox>
      <div className="flex justify-center my-6 gap-4">
        <Button label={tCommon("actions.cancel")} onClick={cancel} />
        <Button
          label={tCommon("actions.continue")}
          primary
          onClick={() => navigate("../secret-key/generate")}
        />
      </div>
    </Container>
  );
}

export default MnemonicExplanation;
