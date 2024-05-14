import Header from "@components/Header";
import { PopiconsChevronLeftLine } from "@popicons/react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "~/app/components/Button";
import Container from "~/app/components/Container";
import IconButton from "~/app/components/IconButton";

export default function OnChainReceive() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "on_chain",
  });

  return (
    <div className=" flex flex-col overflow-y-auto no-scrollbar h-full">
      <Header
        headerLeft={
          <IconButton
            onClick={() => {
              navigate(-1);
            }}
            icon={<PopiconsChevronLeftLine className="w-5 h-5" />}
          />
        }
      >
        {t("title")}
      </Header>
      <div className="mt-8 h-full">
        <Container justifyBetween maxWidth="sm">
          <div className="text-center dark:text-neutral-200 h-full flex flex-col justify-center items-center">
            <div className="mb-8">
              <p>
                <Trans
                  i18nKey={"instructions1"}
                  t={t}
                  components={[<strong key="instruction1-strong"></strong>]}
                />
              </p>
            </div>

            <div className="mb-8">
              <p>
                <Trans
                  i18nKey={"instructions2"}
                  t={t}
                  components={[<strong key="instruction2-strong"></strong>]}
                />
              </p>
            </div>
          </div>
          <div className="mb-4">
            <Button
              type="submit"
              label={t("go")}
              fullWidth
              primary
              onClick={() =>
                window.open("https://getalby.com/onchain_addresses", "_blank")
              }
            />
          </div>
        </Container>
      </div>
    </div>
  );
}
