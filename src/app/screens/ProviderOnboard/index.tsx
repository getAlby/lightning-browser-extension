import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Header from "@components/Header";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "~/app/components/Button";
import Container from "~/app/components/Container";
import IconButton from "~/app/components/IconButton";
import { useAccount } from "~/app/context/AccountContext";
import utils from "~/common/lib/utils";

type Props = {
  action: string;
};

export default function ProviderOnboard(props: Props) {
  function openOptions(path: string) {
    // if we are in the popup
    if (window.location.pathname !== "/options.html") {
      utils.openPage(`options.html#/${path}`);
      // close the popup
      window.close();
    } else {
      navigate(`/${path}`);
    }
  }

  const { account: authAccount } = useAccount();

  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "provider_onboard",
  });

  return (
    <div className=" flex flex-col overflow-y-auto no-scrollbar h-full">
      <Header
        title={t("title")}
        headerLeft={
          <IconButton
            onClick={() => {
              navigate(-1);
            }}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      <div className="mt-8 h-full">
        <Container justifyBetween maxWidth="sm">
          <div className="text-center dark:text-neutral-200 h-full flex flex-col justify-center items-center">
            <div className="mb-8">
              <p>
                <Trans
                  i18nKey={"instructions1"}
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
                openOptions(`accounts/${authAccount?.id}/nostr/settings`)
              }
            />
          </div>
        </Container>
      </div>
    </div>
  );
}
