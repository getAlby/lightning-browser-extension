import ConnectCitadel from "@screens/connectors/ConnectCitadel";
import ConnectEclair from "@screens/connectors/ConnectEclair";
import ConnectGaloy, { galoyUrls } from "@screens/connectors/ConnectGaloy";
import ConnectLnbits from "@screens/connectors/ConnectLnbits";
import ConnectLnd from "@screens/connectors/ConnectLnd";
import ConnectLndHub from "@screens/connectors/ConnectLndHub";
import ConnectMyNode from "@screens/connectors/ConnectMyNode";
import ConnectRaspiBlitz from "@screens/connectors/ConnectRaspiBlitz";
import ConnectStart9 from "@screens/connectors/ConnectStart9";
import ConnectUmbrel from "@screens/connectors/ConnectUmbrel";
import NewWallet from "@screens/connectors/NewWallet";
import i18n from "~/i18n/i18nConfig";
import { translationI18nNamespace } from "~/i18n/namespaces";

import alby from "/static/assets/icons/alby.png";
import citadel from "/static/assets/icons/citadel.png";
import eclair from "/static/assets/icons/eclair.jpg";
import galoyBitcoinBeach from "/static/assets/icons/galoy_bitcoin_beach.png";
import galoyBitcoinJungle from "/static/assets/icons/galoy_bitcoin_jungle.png";
import lnbits from "/static/assets/icons/lnbits.png";
import lnd from "/static/assets/icons/lnd.png";
import lndhub from "/static/assets/icons/lndhub.png";
import mynode from "/static/assets/icons/mynode.png";
import raspiblitz from "/static/assets/icons/raspiblitz.png";
import start9 from "/static/assets/icons/start9.png";
import umbrel from "/static/assets/icons/umbrel.png";

const galoyPaths: { [key: string]: keyof typeof galoyUrls } = {
  bitcoinBeach: "galoy-bitcoin-beach",
  bitcoinJungle: "galoy-bitcoin-jungle",
};

function getConnectorRoutes() {
  return [
    {
      path: "create-wallet",
      element: <NewWallet />,
      title: i18n.t("choose_connector.alby.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.alby.description",
        translationI18nNamespace
      ),
      logo: alby,
    },
    {
      path: "lnd",
      element: <ConnectLnd />,
      title: i18n.t("choose_connector.lnd.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.lnd.description",
        translationI18nNamespace
      ),
      logo: lnd,
    },
    {
      path: "lnd-hub",
      element: <ConnectLndHub />,
      title: i18n.t("choose_connector.lndhub.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.lndhub.description",
        translationI18nNamespace
      ),
      logo: lndhub,
    },
    {
      path: "lnbits",
      element: <ConnectLnbits />,
      title: i18n.t("choose_connector.lnbits.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.lnbits.description",
        translationI18nNamespace
      ),
      logo: lnbits,
    },
    {
      path: "eclair",
      element: <ConnectEclair />,
      title: i18n.t("choose_connector.eclair.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.eclair.description",
        translationI18nNamespace
      ),
      logo: eclair,
    },
    {
      path: "citadel",
      element: <ConnectCitadel />,
      title: i18n.t("choose_connector.citadel.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.citadel.description",
        translationI18nNamespace
      ),
      logo: citadel,
    },
    {
      path: "umbrel",
      element: <ConnectUmbrel />,
      title: i18n.t("choose_connector.umbrel.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.umbrel.description",
        translationI18nNamespace
      ),
      logo: umbrel,
    },
    {
      path: "mynode",
      element: <ConnectMyNode />,
      title: i18n.t("choose_connector.mynode.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.mynode.description",
        translationI18nNamespace
      ),
      logo: mynode,
    },
    {
      path: "start9",
      element: <ConnectStart9 />,
      title: i18n.t("choose_connector.start9.title", translationI18nNamespace),
      description: i18n.t(
        "choose_connector.start9.description",
        translationI18nNamespace
      ),
      logo: start9,
    },
    {
      path: "raspiblitz",
      element: <ConnectRaspiBlitz />,
      title: i18n.t(
        "choose_connector.raspiblitz.title",
        translationI18nNamespace
      ),
      description: i18n.t(
        "choose_connector.raspiblitz.description",
        translationI18nNamespace
      ),
      logo: raspiblitz,
    },
    {
      path: galoyPaths.bitcoinBeach,
      element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
      title: i18n.t(
        "choose_connector.bitcoin_beach.title",
        translationI18nNamespace
      ),
      description: i18n.t(
        "choose_connector.bitcoin_beach.description",
        translationI18nNamespace
      ),
      logo: galoyBitcoinBeach,
    },
    {
      path: galoyPaths.bitcoinJungle,
      element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
      title: i18n.t(
        "choose_connector.bitcoin_jungle.title",
        translationI18nNamespace
      ),
      description: i18n.t(
        "choose_connector.bitcoin_jungle.description",
        translationI18nNamespace
      ),
      logo: galoyBitcoinJungle,
    },
  ];
}

export default getConnectorRoutes;
