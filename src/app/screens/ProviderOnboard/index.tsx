import Header from "@components/Header";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "~/app/components/Button";
import Container from "~/app/components/Container";
import PublisherCard from "~/app/components/PublisherCard";
import { useAccount } from "~/app/context/AccountContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import utils from "~/common/lib/utils";
import { OriginData } from "~/types";

type Props = {
  action: string;
};

export default function ProviderOnboard(props: Props) {
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;

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
      <Header title={t("title")} />
      <div className="h-full">
        <Container justifyBetween maxWidth="sm">
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
            isSmall={false}
          />
          <div className="text-center dark:text-neutral-200 h-full flex flex-col justify-center items-center">
            <div className="mb-8">
              <p>{t("instructions1")}</p>
            </div>
          </div>
          <Button
            type="submit"
            label={t("go")}
            fullWidth
            primary
            onClick={() =>
              openOptions(`accounts/${authAccount?.id}/nostr/settings`)
            }
          />
        </Container>
      </div>
    </div>
  );
}
