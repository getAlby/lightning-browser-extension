import ConnectBtcpay from "@screens/connectors/ConnectBtcpay";
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

import ConnectCommando from "../screens/connectors/ConnectCommando";
import alby from "/static/assets/icons/alby.png";
import btcpay from "/static/assets/icons/btcpay.svg";
import citadel from "/static/assets/icons/citadel.png";
import core_ln from "/static/assets/icons/core_ln.svg";
import eclair from "/static/assets/icons/eclair.jpg";
import galoyBitcoinBeach from "/static/assets/icons/galoy_bitcoin_beach.png";
import galoyBitcoinJungle from "/static/assets/icons/galoy_bitcoin_jungle.png";
import lnbits from "/static/assets/icons/lnbits.png";
import lnd from "/static/assets/icons/lnd.png";
import lndhubBlueWallet from "/static/assets/icons/lndhub_bluewallet.png";
import lndhubGo from "/static/assets/icons/lndhub_go.png";
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
      title: i18n.t("translation:choose_connector.alby.title"),
      description: i18n.t("translation:choose_connector.alby.description"),
      logo: alby,
    },
    {
      path: "lnd",
      element: <ConnectLnd />,
      title: i18n.t("translation:choose_connector.lnd.title"),
      description: i18n.t("translation:choose_connector.lnd.description"),
      logo: lnd,
    },
    {
      path: "commando",
      element: <ConnectCommando />,
      title: i18n.t("translation:choose_connector.commando.title"),
      description: i18n.t("translation:choose_connector.commando.description"),
      logo: core_ln,
    },
    {
      path: "lnbits",
      element: <ConnectLnbits />,
      title: i18n.t("translation:choose_connector.lnbits.title"),
      description: i18n.t("translation:choose_connector.lnbits.description"),
      logo: lnbits,
    },
    {
      path: "lnd-hub-go",
      element: <ConnectLndHub lndHubType="lndhub_go" />,
      title: i18n.t("translation:choose_connector.lndhub_go.title"),
      description: i18n.t("translation:choose_connector.lndhub_go.description"),
      logo: lndhubGo,
    },
    {
      path: "lnd-hub-bluewallet",
      element: <ConnectLndHub />,
      title: i18n.t("translation:choose_connector.lndhub_bluewallet.title"),
      description: i18n.t(
        "translation:choose_connector.lndhub_bluewallet.description"
      ),
      logo: lndhubBlueWallet,
    },
    {
      path: "eclair",
      element: <ConnectEclair />,
      title: i18n.t("translation:choose_connector.eclair.title"),
      description: i18n.t("translation:choose_connector.eclair.description"),
      logo: eclair,
    },
    {
      path: "citadel",
      element: <ConnectCitadel />,
      title: i18n.t("translation:choose_connector.citadel.title"),
      description: i18n.t("translation:choose_connector.citadel.description"),
      logo: citadel,
    },
    {
      path: "umbrel",
      element: <ConnectUmbrel />,
      title: i18n.t("translation:choose_connector.umbrel.title"),
      description: i18n.t("translation:choose_connector.umbrel.description"),
      logo: umbrel,
    },
    {
      path: "mynode",
      element: <ConnectMyNode />,
      title: i18n.t("translation:choose_connector.mynode.title"),
      description: i18n.t("translation:choose_connector.mynode.description"),
      logo: mynode,
    },
    {
      path: "start9",
      element: <ConnectStart9 />,
      title: i18n.t("translation:choose_connector.start9.title"),
      description: i18n.t("translation:choose_connector.start9.description"),
      logo: start9,
    },
    {
      path: "raspiblitz",
      element: <ConnectRaspiBlitz />,
      title: i18n.t("translation:choose_connector.raspiblitz.title"),
      description: i18n.t(
        "translation:choose_connector.raspiblitz.description"
      ),
      logo: raspiblitz,
    },
    {
      path: galoyPaths.bitcoinBeach,
      element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
      title: i18n.t("translation:choose_connector.bitcoin_beach.title"),
      description: i18n.t(
        "translation:choose_connector.bitcoin_beach.description"
      ),
      logo: galoyBitcoinBeach,
    },
    {
      path: galoyPaths.bitcoinJungle,
      element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
      title: i18n.t("translation:choose_connector.bitcoin_jungle.title"),
      description: i18n.t(
        "translation:choose_connector.bitcoin_jungle.description"
      ),
      logo: galoyBitcoinJungle,
    },
    {
      path: "btcpay",
      element: <ConnectBtcpay />,
      title: i18n.t("translation:choose_connector.btcpay.title"),
      description: i18n.t("translation:choose_connector.btcpay.description"),
      logo: btcpay,
    },
  ];
}

export default getConnectorRoutes;
