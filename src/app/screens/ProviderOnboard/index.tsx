import {
  ClockIcon,
  TwoKeysIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import { useTranslation } from "react-i18next";
import ConfirmOrCancel from "~/app/components/ConfirmOrCancel";
import Container from "~/app/components/Container";
import PublisherCard from "~/app/components/PublisherCard";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import InfoCircleIcon from "~/app/icons/InfoCircleIcon";
import { OriginData } from "~/types";

type Props = {
  action: string;
};

export default function ProviderOnboard(props: Props) {
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;

  // function openOptions(path: string) {
  //   // if we are in the popup
  //   if (window.location.pathname !== "/options.html") {
  //     utils.openPage(`options.html#/${path}`);
  //     // close the popup
  //     window.close();
  //   } else {
  //     navigate(`/${path}`);
  //   }
  // }

  //const { account: authAccount } = useAccount();

  //const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "provider_onboard",
  });

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <Container justifyBetween maxWidth="sm">
        <div>
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
            isSmall={false}
          />
          <div className="dark:text-white pt-6">
            <div className="mb-2 flex items-center">
              <TwoKeysIcon className="w-7 h-7 mr-2" />
              <p className="dark:text-white">{t("request1")}</p>
            </div>
            <div className="mb-2 flex items-center">
              <InfoCircleIcon className="w-7 h-7 mr-2" />
              <p className="dark:text-white">{t("request2")}</p>
            </div>
            <div className="mb-2 flex items-center">
              <ClockIcon className="w-7 h-7 mr-2" />
              <p className="dark:text-white">{t("request3")}</p>
            </div>
          </div>
        </div>
        <div className="text-center flex flex-col">
          <ConfirmOrCancel
            label={t("actions.start_setup")}
            onConfirm={() => {}}
            onCancel={() => {}}
          />
        </div>
      </Container>
    </div>
  );
}
