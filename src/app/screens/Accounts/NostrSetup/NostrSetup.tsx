import {
  KeyIcon,
  MnemonicIcon,
  ReceiveIcon,
  TwoKeysIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import Container from "@components/Container";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CardButton from "~/app/components/CardButton";
import CardButtonGroup from "~/app/components/CardButton/Group";
import { ContentBox } from "~/app/components/ContentBox";
import Hyperlink from "~/app/components/Hyperlink";

function NostrSetup() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.nostr.setup",
  });
  const navigate = useNavigate();
  const [step, setStep] = useState<"start" | "import">("start");

  return (
    <div>
      <Container maxWidth="md">
        <ContentBox>
          {step === "start" && (
            <>
              <h1 className="font-bold text-2xl dark:text-white">
                {t("title")}
              </h1>
              <p className="text-gray-500 dark:text-neutral-500">
                {t("description")}
              </p>
              <p className="text-gray-500 dark:text-neutral-500">
                <Trans
                  i18nKey={"description2"}
                  t={t}
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <span className="font-bold"></span>,
                  ]}
                />
              </p>

              <CardButtonGroup>
                <CardButton
                  title={t("new.label")}
                  description={t("new.description")}
                  icon={TwoKeysIcon}
                  onClick={() => navigate("../secret-key/generate")}
                />
                <CardButton
                  title={t("import.label")}
                  description={t("import.description")}
                  icon={ReceiveIcon}
                  onClick={() => setStep("import")}
                />
              </CardButtonGroup>
            </>
          )}
          {step === "import" && (
            <>
              <h1 className="font-bold text-2xl dark:text-white">
                {t("import.title")}
              </h1>

              <CardButtonGroup>
                <CardButton
                  title={t("import.private_key.label")}
                  description={t("import.private_key.description")}
                  icon={KeyIcon}
                  onClick={() => navigate("../nostr/settings")}
                />
                <CardButton
                  title={t("import.recovery_phrase.label")}
                  description={t("import.recovery_phrase.description")}
                  icon={MnemonicIcon}
                  onClick={() => navigate("../secret-key/import")}
                />
              </CardButtonGroup>
            </>
          )}
          <div className="text-center text-gray-500 dark:text-neutral-500">
            <Trans
              i18nKey={"new_to_nostr"}
              t={t}
              components={[
                // eslint-disable-next-line react/jsx-key
                <Hyperlink
                  href="https://www.nostr.how/"
                  target="_blank"
                  rel="noreferer noopener"
                ></Hyperlink>,
              ]}
            />
          </div>
        </ContentBox>
      </Container>
    </div>
  );
}

export default NostrSetup;
