import ConnectBtcpay from "@screens/connectors/ConnectBtcpay";
import ConnectCitadel from "@screens/connectors/ConnectCitadel";
import ConnectEclair from "@screens/connectors/ConnectEclair";
import ConnectGaloy, { galoyUrls } from "@screens/connectors/ConnectGaloy";
import ConnectKollider from "@screens/connectors/ConnectKollider";
import ConnectLnbits from "@screens/connectors/ConnectLnbits";
import ConnectLnc from "@screens/connectors/ConnectLnc";
import ConnectLnd from "@screens/connectors/ConnectLnd";
import ConnectLndHub from "@screens/connectors/ConnectLndHub";
import ConnectMyNode from "@screens/connectors/ConnectMyNode";
import ConnectRaspiBlitz from "@screens/connectors/ConnectRaspiBlitz";
import ConnectStart9 from "@screens/connectors/ConnectStart9";
import ConnectUmbrel from "@screens/connectors/ConnectUmbrel";
import i18n from "~/i18n/i18nConfig";

import ConnectCommando from "../screens/connectors/ConnectCommando";
import btcpay from "/static/assets/icons/btcpay.svg";
import citadel from "/static/assets/icons/citadel.png";
import core_ln from "/static/assets/icons/core_ln.svg";
import eclair from "/static/assets/icons/eclair.jpg";
import galoyBitcoinBeach from "/static/assets/icons/galoy_bitcoin_beach.png";
import galoyBitcoinJungle from "/static/assets/icons/galoy_bitcoin_jungle.png";
import kolliderLogo from "/static/assets/icons/kollider.png";
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
      path: "lnd",
      element: <ConnectLnd logo={lnd} />,
      title: i18n.t("translation:choose_connector.lnd.title"),
      logo: lnd,
    },
    {
      path: "lnc",
      element: <ConnectLnc logo={lnd} />,
      title: i18n.t("translation:choose_connector.lnc.title"),
      logo: lnd,
    },
    {
      path: "commando",
      element: <ConnectCommando logo={core_ln} />,
      title: i18n.t("translation:choose_connector.commando.title"),
      logo: core_ln,
    },
    {
      path: "lnbits",
      element: <ConnectLnbits logo={lnbits} />,
      title: i18n.t("translation:choose_connector.lnbits.title"),
      logo: lnbits,
    },
    {
      path: "lnd-hub-go",
      element: <ConnectLndHub logo={lndhubGo} lndHubType="lndhub_go" />,
      title: i18n.t("translation:choose_connector.lndhub_go.title"),
      logo: lndhubGo,
    },
    {
      path: "kollider",
      element: <ConnectKollider logo={kolliderLogo} variant="select" />,
      title: i18n.t("translation:choose_connector.kollider.title"),
      description: i18n.t("translation:choose_connector.kollider.description"),
      logo: kolliderLogo,
      children: [
        {
          path: "create",
          element: <ConnectKollider variant="create" />,
        },
        {
          path: "login",
          element: <ConnectKollider variant="login" />,
        },
      ],
    },
    {
      path: "lnd-hub-bluewallet",
      element: <ConnectLndHub logo={lndhubBlueWallet} />,
      title: i18n.t("translation:choose_connector.lndhub_bluewallet.title"),
      logo: lndhubBlueWallet,
    },
    {
      path: "eclair",
      element: <ConnectEclair logo={eclair} />,
      title: i18n.t("translation:choose_connector.eclair.title"),
      logo: eclair,
    },
    {
      path: "citadel",
      element: <ConnectCitadel logo={citadel} />,
      title: i18n.t("translation:choose_connector.citadel.title"),
      logo: citadel,
    },
    {
      path: "umbrel",
      element: <ConnectUmbrel logo={umbrel} />,
      title: i18n.t("translation:choose_connector.umbrel.title"),
      logo: umbrel,
    },
    {
      path: "mynode",
      element: <ConnectMyNode logo={mynode} />,
      title: i18n.t("translation:choose_connector.mynode.title"),
      logo: mynode,
    },
    {
      path: "start9",
      element: <ConnectStart9 logo={start9} />,
      title: i18n.t("translation:choose_connector.start9.title"),
      logo: start9,
    },
    {
      path: "raspiblitz",
      element: <ConnectRaspiBlitz logo={raspiblitz} />,
      title: i18n.t("translation:choose_connector.raspiblitz.title"),
      logo: raspiblitz,
    },
    {
      path: galoyPaths.bitcoinBeach,
      element: (
        <ConnectGaloy
          logo={galoyBitcoinBeach}
          instance={galoyPaths.bitcoinBeach}
        />
      ),
      title: i18n.t("translation:choose_connector.bitcoin_beach.title"),
      logo: galoyBitcoinBeach,
    },
    {
      path: galoyPaths.bitcoinJungle,
      element: (
        <ConnectGaloy
          logo={galoyBitcoinJungle}
          instance={galoyPaths.bitcoinJungle}
        />
      ),
      title: i18n.t("translation:choose_connector.bitcoin_jungle.title"),
      logo: galoyBitcoinJungle,
    },
    {
      path: "btcpay",
      element: <ConnectBtcpay logo={btcpay} />,
      title: i18n.t("translation:choose_connector.btcpay.title"),
      logo: btcpay,
    },
  ];
}

export default getConnectorRoutes;
