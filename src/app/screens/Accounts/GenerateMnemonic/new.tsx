import Container from "@components/Container";
import { PopiconsDownloadLine, PopiconsKeyLine } from "@popicons/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Button from "~/app/components/Button";
import { ContentBox } from "~/app/components/ContentBox";
import { ExtensionKeyCard } from "~/app/components/ExtensionKeyCard";
import MnemonicDescription from "~/app/components/mnemonic/MnemonicDescription";
import { useTheme } from "~/app/utils";
import api from "~/common/lib/api";

function MnemonicExplanation() {
  const navigate = useNavigate();
  const theme = useTheme();

  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic.new",
  });
  const { t: tCommon } = useTranslation("common");

  const [cardSelected, setIsCardSelected] = useState("backup");

  const [hasMnemonic, setHasMnemonic] = useState(false);

  useEffect(() => {
    async function fetchAccountInfo() {
      try {
        const fetchedAccount = await api.getAccount();

        if (fetchedAccount.hasMnemonic) {
          setHasMnemonic(true);
        } else {
          setHasMnemonic(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetchAccountInfo();
  }, []);

  return (
    <Container maxWidth="md">
      <div className="flex justify-end mt-6 text-xs">
        <p className="text-gray-600 dark:text-neutral-400">
          <Link
            to="../../nostr/settings"
            relative="path"
            className="text-blue-600"
          >
            {t("nostr")}
          </Link>
        </p>
      </div>
      <ContentBox>
        <h1 className="font-bold text-2xl dark:text-white">{t("title")}</h1>
        <MnemonicDescription />
        <img
          src={`assets/images/master_key_${theme}.png`}
          alt="Master Key"
          className="max-w-[412px] mx-auto w-full"
        />

        <div className="flex flex-row justify-between gap-x-6">
          <ExtensionKeyCard
            title={t("secure.title")}
            description={t("secure.description")}
            icon={
              <PopiconsKeyLine className="w-8 h-8 text-gray-600 dark:text-neutral-400" />
            }
            onClick={async () => {
              setIsCardSelected("backup");
            }}
          />

          <ExtensionKeyCard
            title={t("import.title")}
            description={t("import.description")}
            icon={
              <PopiconsDownloadLine className="w-8 h-8 text-gray-600 dark:text-neutral-400" />
            }
            onClick={async () => {
              setIsCardSelected("import");
            }}
          />
        </div>

        <div className="flex justify-center w-64 mx-auto">
          <Button
            label={tCommon("actions.next")}
            primary
            flex
            onClick={() =>
              cardSelected == "backup"
                ? hasMnemonic
                  ? navigate("../secret-key/backup")
                  : navigate("../secret-key/generate")
                : navigate("../secret-key/import")
            }
          />
        </div>
      </ContentBox>
    </Container>
  );
}

export default MnemonicExplanation;
