import ChooseConnector from "@screens/connectors/ChooseConnector";
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
import lightning_node from "/static/assets/icons/lightning_node.png";
import lightning_terminal from "/static/assets/icons/lightning_terminal.png";
import lnbits from "/static/assets/icons/lnbits.png";
import lnd from "/static/assets/icons/lnd.png";
import lndhubBlueWallet from "/static/assets/icons/lndhub_bluewallet.png";
import lndhubGo from "/static/assets/icons/lndhub_go.png";
import mynode from "/static/assets/icons/mynode.png";
import raspiblitz from "/static/assets/icons/raspiblitz.png";
import start9 from "/static/assets/icons/start9.png";
import umbrel from "/static/assets/icons/umbrel.png";

interface ConnectorRoute {
  path: string;
  element: JSX.Element;
  title: string;
  description?: string;
  logo: string;
  children?: {
    path: string;
    element: JSX.Element;
    title?: string;
    description?: string;
    logo?: string;
  }[];
}

const galoyPaths: { [key: string]: keyof typeof galoyUrls } = {
  bitcoinBeach: "galoy-bitcoin-beach",
  bitcoinJungle: "galoy-bitcoin-jungle",
};

const umbrelConnectorRoutes = [
  {
    path: "lnd-connect",
    element: <ConnectUmbrel />,
    title: i18n.t("translation:choose_connector.lightning_node.title"),
    logo: lightning_node,
  },
  {
    path: "lnc",
    element: <ConnectLnc />,
    title: i18n.t("translation:choose_connector.lnc.title"),
    logo: lightning_terminal,
  },
  {
    path: "commando",
    element: <ConnectCommando />,
    title: i18n.t("translation:choose_connector.commando.title"),
    logo: core_ln,
  },
  {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: i18n.t("translation:choose_connector.lnbits.title"),
    logo: lnbits,
  },
];

const citadelConnectorRoutes = [
  {
    path: "citadel",
    element: <ConnectCitadel />,
    title: i18n.t("translation:choose_connector.citadel.title"),
    logo: citadel,
  },
  {
    path: "lnc",
    element: <ConnectLnc />,
    title: i18n.t("translation:choose_connector.lnc.title"),
    logo: lightning_terminal,
  },
  {
    path: "commando",
    element: <ConnectCommando />,
    title: i18n.t("translation:choose_connector.commando.title"),
    logo: core_ln,
  },
  {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: i18n.t("translation:choose_connector.lnbits.title"),
    logo: lnbits,
  },
];

const raspiblitzConnectorRoutes = [
  {
    path: "lnd",
    element: <ConnectRaspiBlitz />,
    title: i18n.t("translation:choose_connector.lnd.title"),
    logo: lnd,
  },
  {
    path: "lnc",
    element: <ConnectLnc />,
    title: i18n.t("translation:choose_connector.lnc.title"),
    logo: lightning_terminal,
  },
  {
    path: "commando",
    element: <ConnectCommando />,
    title: i18n.t("translation:choose_connector.commando.title"),
    logo: core_ln,
  },
  {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: i18n.t("translation:choose_connector.lnbits.title"),
    logo: lnbits,
  },
];

const myNodeConnectorRoutes = [
  {
    path: "lnd",
    element: <ConnectMyNode />,
    title: i18n.t("translation:choose_connector.lnd.title"),
    logo: lnd,
  },
  {
    path: "lnc",
    element: <ConnectLnc />,
    title: i18n.t("translation:choose_connector.lnc.title"),
    logo: lightning_terminal,
  },
  {
    path: "commando",
    element: <ConnectCommando />,
    title: i18n.t("translation:choose_connector.commando.title"),
    logo: core_ln,
  },
  {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: i18n.t("translation:choose_connector.lnbits.title"),
    logo: lnbits,
  },
];

const start9ConnectorRoutes = [
  {
    path: "lnd",
    element: <ConnectStart9 />,
    title: i18n.t("translation:choose_connector.lnd.title"),
    logo: lnd,
  },
  {
    path: "lnc",
    element: <ConnectLnc />,
    title: i18n.t("translation:choose_connector.lnc.title"),
    logo: lightning_terminal,
  },
  {
    path: "commando",
    element: <ConnectCommando />,
    title: i18n.t("translation:choose_connector.commando.title"),
    logo: core_ln,
  },
  {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: i18n.t("translation:choose_connector.lnbits.title"),
    logo: lnbits,
  },
];

const kolliderConnectorRoutes = [
  {
    path: "create",
    element: <ConnectKollider variant="create" />,
  },
  {
    path: "login",
    element: <ConnectKollider variant="login" />,
  },
];

function getConnectorRoutes(): ConnectorRoute[] {
  return [
    {
      path: "lnd",
      element: <ConnectLnd />,
      title: i18n.t("translation:choose_connector.lnd.title"),
      logo: lnd,
    },
    {
      path: "lnc",
      element: <ConnectLnc />,
      title: i18n.t("translation:choose_connector.lnc.title"),
      logo: lightning_terminal,
    },
    {
      path: "commando",
      element: <ConnectCommando />,
      title: i18n.t("translation:choose_connector.commando.title"),
      logo: core_ln,
    },
    {
      path: "lnbits",
      element: <ConnectLnbits />,
      title: i18n.t("translation:choose_connector.lnbits.title"),
      logo: lnbits,
    },
    {
      path: "lnd-hub-go",
      element: <ConnectLndHub lndHubType="lndhub_go" />,
      title: i18n.t("translation:choose_connector.lndhub_go.title"),
      logo: lndhubGo,
    },
    {
      path: "kollider",
      element: <ConnectKollider variant="select" />,
      title: i18n.t("translation:choose_connector.kollider.title"),
      description: i18n.t("translation:choose_connector.kollider.description"),
      logo: kolliderLogo,
      children: kolliderConnectorRoutes,
    },
    {
      path: "lnd-hub-bluewallet",
      element: <ConnectLndHub />,
      title: i18n.t("translation:choose_connector.lndhub_bluewallet.title"),
      logo: lndhubBlueWallet,
    },
    {
      path: "eclair",
      element: <ConnectEclair />,
      title: i18n.t("translation:choose_connector.eclair.title"),
      logo: eclair,
    },
    {
      path: "citadel",
      element: (
        <ChooseConnector
          title={i18n.t("translation:choose_citadel_connector.title")}
          description={i18n.t(
            "translation:choose_citadel_connector.description"
          )}
          connectorRoutes={citadelConnectorRoutes}
        />
      ),
      title: i18n.t("translation:choose_connector.citadel.title"),
      logo: citadel,
      children: citadelConnectorRoutes,
    },
    {
      path: "umbrel",
      element: (
        <ChooseConnector
          title={i18n.t("translation:choose_umbrel_connector.title")}
          description={i18n.t(
            "translation:choose_umbrel_connector.description"
          )}
          connectorRoutes={umbrelConnectorRoutes}
        />
      ),
      title: i18n.t("translation:choose_connector.umbrel.title"),
      logo: umbrel,
      children: umbrelConnectorRoutes,
    },
    {
      path: "mynode",
      element: (
        <ChooseConnector
          title={i18n.t("translation:choose_mynode_connector.title")}
          description={i18n.t(
            "translation:choose_mynode_connector.description"
          )}
          connectorRoutes={myNodeConnectorRoutes}
        />
      ),
      title: i18n.t("translation:choose_connector.mynode.title"),
      logo: mynode,
      children: myNodeConnectorRoutes,
    },
    {
      path: "start9",
      element: (
        <ChooseConnector
          title={i18n.t("translation:choose_start9_connector.title")}
          description={i18n.t(
            "translation:choose_start9_connector.description"
          )}
          connectorRoutes={start9ConnectorRoutes}
        />
      ),
      title: i18n.t("translation:choose_connector.start9.title"),
      logo: start9,
      children: start9ConnectorRoutes,
    },
    {
      path: "raspiblitz",
      element: (
        <ChooseConnector
          title={i18n.t("translation:choose_raspiblitz_connector.title")}
          description={i18n.t(
            "translation:choose_raspiblitz_connector.description"
          )}
          connectorRoutes={raspiblitzConnectorRoutes}
        />
      ),
      title: i18n.t("translation:choose_connector.raspiblitz.title"),
      logo: raspiblitz,
      children: raspiblitzConnectorRoutes,
    },
    {
      path: galoyPaths.bitcoinBeach,
      element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
      title: i18n.t("translation:choose_connector.bitcoin_beach.title"),
      logo: galoyBitcoinBeach,
    },
    {
      path: galoyPaths.bitcoinJungle,
      element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
      title: i18n.t("translation:choose_connector.bitcoin_jungle.title"),
      logo: galoyBitcoinJungle,
    },
    {
      path: "btcpay",
      element: <ConnectBtcpay />,
      title: i18n.t("translation:choose_connector.btcpay.title"),
      logo: btcpay,
    },
  ];
}

export { getConnectorRoutes, ConnectorRoute };
