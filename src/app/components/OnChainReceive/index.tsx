import { Trans, useTranslation } from "react-i18next";
import Button from "~/app/components/Button";
import Container from "~/app/components/Container";

export default function OnChainReceive() {
  const { t } = useTranslation("translation", {
    keyPrefix: "receive.on_chain",
  });

  return (
    <Container justifyBetween maxWidth="sm">
      <div className="text-center dark:text-neutral-200 h-full flex flex-col justify-center items-center">
        <div className="mb-8">
          <p>
            <Trans
              i18nKey={"instructions1"}
              t={t}
              // eslint-disable-next-line react/jsx-key
              components={[<strong></strong>]}
            />
          </p>
        </div>

        <div className="mb-8">
          <p>
            <Trans
              i18nKey={"instructions2"}
              t={t}
              // eslint-disable-next-line react/jsx-key
              components={[<strong></strong>]}
            />
          </p>
        </div>
      </div>
      <div className="mb-4">
        <a href="https://getalby.com/node/receive">
          <Button
            type="submit"
            label={t("go")}
            fullWidth
            primary
            onClick={() => window.open(`https://getalby.com/user`, "_blank")}
          />
        </a>
      </div>
    </Container>
  );
}
