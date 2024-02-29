import Container from "@components/Container";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import MnemonicDescription from "~/app/components/mnemonic/MnemonicDescription";
import { useTheme } from "~/app/utils";

function MnemonicExplanation() {
  const navigate = useNavigate();
  const theme = useTheme();

  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic.new",
  });
  const { t: tCommon } = useTranslation("common");

  return (
    <Container>
      <ContentBox>
        <h1 className="font-bold text-2xl dark:text-white">{t("title")}</h1>
        <MnemonicDescription />
        <img
          src={`assets/images/master_key_${theme}.png`}
          alt="Master Key"
          className="max-w-[412px] mx-auto w-full"
        />

        <div className="flex justify-center mt-6 w-64 mx-auto">
          <Button
            label={tCommon("actions.continue")}
            primary
            flex
            onClick={() => navigate("../secret-key/generate")}
          />
        </div>
      </ContentBox>
    </Container>
  );
}

export default MnemonicExplanation;
