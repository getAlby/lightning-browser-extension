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
import { Route } from "react-router-dom";
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

export const normalizeKey = (key: string) =>
  key as unknown as TemplateStringsArray;

interface ChildRoute {
  index?: boolean;
  path?: string;
  element: JSX.Element;
}

interface ConnectorElementChildRoute extends ChildRoute {
  title: string;
  path: string;
  description?: string;
  logo: string;
}

interface Route {
  path: string;
  element: JSX.Element;
  title: string;
  description?: string;
  logo: string;
}

interface ConnectorRoute extends Route {
  children?: (ChildRoute | ConnectorElementChildRoute)[];
}

const galoyPaths: { [key: string]: keyof typeof galoyUrls } = {
  bitcoinBeach: "galoy-bitcoin-beach",
  bitcoinJungle: "galoy-bitcoin-jungle",
};

const kolliderConnectorRoutes: ChildRoute[] = [
  {
    index: true,
    element: <ConnectKollider variant="select" />,
  },
  {
    path: "create",
    element: <ConnectKollider variant="create" />,
  },
  {
    path: "login",
    element: <ConnectKollider variant="login" />,
  },
];

const connectorMap: { [key: string]: ConnectorRoute } = {
  lnd: {
    path: "lnd",
    element: <ConnectLnd />,
    title: i18n.t("translation:choose_connector.lnd.title"),
    logo: lnd,
  },
  "umbrel-lnd": {
    path: "lnd",
    element: <ConnectUmbrel />,
    title: i18n.t("translation:choose_connector.umbrel_lightning_node.title"),
    logo: lightning_node,
  },
  "raspiblitz-lnd": {
    path: "lnd",
    element: <ConnectRaspiBlitz />,
    title: i18n.t("translation:choose_connector.lnd.title"),
    logo: lnd,
  },
  "mynode-lnd": {
    path: "lnd",
    element: <ConnectMyNode />,
    title: i18n.t("translation:choose_connector.lnd.title"),
    logo: lnd,
  },
  "start9-lnd": {
    path: "lnd",
    element: <ConnectStart9 />,
    title: i18n.t("translation:choose_connector.lnd.title"),
    logo: lnd,
  },
  lnc: {
    path: "lnc",
    element: <ConnectLnc />,
    title: i18n.t("translation:choose_connector.lnc.title"),
    logo: lightning_terminal,
  },
  commando: {
    path: "commando",
    element: <ConnectCommando />,
    title: i18n.t("translation:choose_connector.commando.title"),
    logo: core_ln,
  },
  lnbits: {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: i18n.t("translation:choose_connector.lnbits.title"),
    logo: lnbits,
  },
  citadel: {
    path: "citadel",
    element: <ConnectCitadel />,
    title: i18n.t("translation:choose_connector.citadel.title"),
    logo: citadel,
  },
  "lnd-hub-go": {
    path: "lnd-hub-go",
    element: <ConnectLndHub lndHubType="lndhub_go" />,
    title: i18n.t("translation:choose_connector.lndhub_go.title"),
    logo: lndhubGo,
  },
  "lnd-hub-bluewallet": {
    path: "lnd-hub-bluewallet",
    element: <ConnectLndHub />,
    title: i18n.t("translation:choose_connector.lndhub_bluewallet.title"),
    logo: lndhubBlueWallet,
  },
  eclair: {
    path: "eclair",
    element: <ConnectEclair />,
    title: i18n.t("translation:choose_connector.eclair.title"),
    logo: eclair,
  },
  kollider: {
    path: "kollider",
    element: <ConnectKollider variant="select" />,
    title: i18n.t("translation:choose_connector.kollider.title"),
    description: i18n.t("translation:choose_connector.kollider.description"),
    logo: kolliderLogo,
    children: kolliderConnectorRoutes,
  },
  [galoyPaths.bitcoinBeach]: {
    path: galoyPaths.bitcoinBeach,
    element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
    title: i18n.t("translation:choose_connector.bitcoin_beach.title"),
    logo: galoyBitcoinBeach,
  },
  [galoyPaths.bitcoinJungle]: {
    path: galoyPaths.bitcoinJungle,
    element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
    title: i18n.t("translation:choose_connector.bitcoin_jungle.title"),
    logo: galoyBitcoinJungle,
  },
  btcpay: {
    path: "btcpay",
    element: <ConnectBtcpay />,
    title: i18n.t("translation:choose_connector.btcpay.title"),
    logo: btcpay,
  },
};

function getDistribution(key: string): ConnectorRoute {
  const name = i18n.t(normalizeKey(`translation:distributions.${key}.name`));
  const children = distributionMap[key]["children"];

  return {
    path: key,
    element: (
      <ChooseConnector
        title={i18n.t("translation:distributions.title", { name })}
        description={i18n.t("translation:distributions.description", { name })}
        connectorRoutes={children}
      />
    ),
    title: i18n.t(normalizeKey(`translation:choose_connector.${key}.title`)),
    logo: distributionMap[key]["logo"],
    children,
  };
}

const distributionMap: { [key: string]: { logo: string; children: Route[] } } =
  {
    citadel: {
      logo: citadel,
      children: [
        connectorMap["citadel"],
        connectorMap["lnc"],
        connectorMap["commando"],
        connectorMap["lnbits"],
      ],
    },
    umbrel: {
      logo: umbrel,
      children: [
        connectorMap["umbrel-lnd"],
        connectorMap["lnc"],
        connectorMap["commando"],
        connectorMap["lnbits"],
      ],
    },
    mynode: {
      logo: mynode,
      children: [
        connectorMap["mynode-lnd"],
        connectorMap["lnc"],
        connectorMap["commando"],
        connectorMap["lnbits"],
      ],
    },
    start9: {
      logo: start9,
      children: [
        connectorMap["start9-lnd"],
        connectorMap["lnc"],
        connectorMap["commando"],
        connectorMap["lnbits"],
      ],
    },
    raspiblitz: {
      logo: raspiblitz,
      children: [
        connectorMap["raspiblitz-lnd"],
        connectorMap["lnc"],
        connectorMap["commando"],
        connectorMap["lnbits"],
      ],
    },
  };

function getConnectorRoutes(): ConnectorRoute[] {
  return [
    connectorMap["lnd"],
    connectorMap["lnc"],
    connectorMap["commando"],
    connectorMap["lnbits"],
    connectorMap["lnd-hub-go"],
    connectorMap["kollider"],
    connectorMap["lnd-hub-bluewallet"],
    connectorMap["eclair"],
    connectorMap["btcpay"],
    connectorMap[galoyPaths.bitcoinBeach],
    connectorMap[galoyPaths.bitcoinJungle],
    getDistribution("citadel"),
    getDistribution("umbrel"),
    getDistribution("mynode"),
    getDistribution("start9"),
    getDistribution("raspiblitz"),
  ];
}

function renderRoutes(routes: (ChildRoute | ConnectorRoute)[]) {
  return routes.map((route: ChildRoute | ConnectorRoute) => {
    if ("children" in route && route.children) {
      if ("element" in route && route.element) {
        return (
          <Route key={route.path} path={route.path}>
            <Route index element={route.element} />
            {renderRoutes(route.children)}
          </Route>
        );
      } else {
        let indexRoute;
        const indexRouteIndex = route.children.findIndex(
          (childRoute) => childRoute.index === true
        );

        if (indexRouteIndex !== -1) {
          indexRoute = route.children.splice(indexRouteIndex, 1)[0];
          return (
            <Route key={route.path} path={route.path}>
              <Route index element={indexRoute.element} />
              {renderRoutes(route.children)}
            </Route>
          );
        }
      }
    } else {
      return (
        <Route key={route.path} path={route.path} element={route.element} />
      );
    }
  });
}

export { getConnectorRoutes, ConnectorRoute, renderRoutes };
