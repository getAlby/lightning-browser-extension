import ChooseConnector from "@screens/connectors/ChooseConnector";
import ConnectBtcpay from "@screens/connectors/ConnectBtcpay";
import ConnectCitadel from "@screens/connectors/ConnectCitadel";
import ConnectEclair from "@screens/connectors/ConnectEclair";
import ConnectGaloy, { galoyUrls } from "@screens/connectors/ConnectGaloy";
import ConnectLaWallet from "@screens/connectors/ConnectLaWallet";
import ConnectLnbits from "@screens/connectors/ConnectLnbits";
import ConnectLnc from "@screens/connectors/ConnectLnc";
import ConnectLnd from "@screens/connectors/ConnectLnd";
import ConnectLndHub from "@screens/connectors/ConnectLndHub";
import ConnectMyNode from "@screens/connectors/ConnectMyNode";
import ConnectRaspiBlitz from "@screens/connectors/ConnectRaspiBlitz";
import ConnectStartOS from "@screens/connectors/ConnectStartOS";
import ConnectUmbrel from "@screens/connectors/ConnectUmbrel";
import { Route } from "react-router-dom";
import i18n from "~/i18n/i18nConfig";

import ConnectAlbyHub from "~/app/screens/connectors/ConnectAlbyHub";
import ConnectNWC from "~/app/screens/connectors/ConnectNWC";
import ConnectVoltage from "~/app/screens/connectors/ConnectVoltage";
import ConnectCommando from "../screens/connectors/ConnectCommando";
import albyhub from "/static/assets/icons/albyhub.png";
import btcpay from "/static/assets/icons/btcpay.svg";
import citadel from "/static/assets/icons/citadel.svg";
import core_ln from "/static/assets/icons/core_ln.svg";
import eclair from "/static/assets/icons/eclair.jpg";
import galoyBitcoinJungle from "/static/assets/icons/galoy_bitcoin_jungle.png";
import galoyBlink from "/static/assets/icons/galoy_blink.png";
import lawallet from "/static/assets/icons/lawallet.png";
import lightning_node from "/static/assets/icons/lightning_node.png";
import lightning_terminal from "/static/assets/icons/lightning_terminal.png";
import lnbits from "/static/assets/icons/lnbits.png";
import lnd from "/static/assets/icons/lnd.png";
import lndhubGo from "/static/assets/icons/lndhub_go.png";
import mynode from "/static/assets/icons/mynode.png";
import nirvati from "/static/assets/icons/nirvati.svg";
import nwc from "/static/assets/icons/nwc.svg";
import raspiblitz from "/static/assets/icons/raspiblitz.png";
import startos from "/static/assets/icons/startos.png";
import umbrel from "/static/assets/icons/umbrel.png";
import voltage from "/static/assets/icons/voltage.png";

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
  blink: "galoy-blink",
  bitcoinJungle: "galoy-bitcoin-jungle",
};

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
  btcpay: {
    path: "btcpay",
    element: <ConnectBtcpay />,
    title: i18n.t("translation:choose_connector.btcpay.title"),
    logo: btcpay,
  },
  "mynode-lnd": {
    path: "lnd",
    element: <ConnectMyNode />,
    title: i18n.t("translation:choose_connector.lnd.title"),
    logo: lnd,
  },
  "startos-lnd": {
    path: "lnd",
    element: <ConnectStartOS />,
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
    element: <ConnectLndHub />,
    title: i18n.t("translation:choose_connector.lndhub_go.title"),
    logo: lndhubGo,
  },
  eclair: {
    path: "eclair",
    element: <ConnectEclair />,
    title: i18n.t("translation:choose_connector.eclair.title"),
    logo: eclair,
  },
  [galoyPaths.blink]: {
    path: galoyPaths.blink,
    element: <ConnectGaloy instance={galoyPaths.blink} />,
    title: i18n.t("translation:choose_connector.blink.title"),
    logo: galoyBlink,
  },
  [galoyPaths.bitcoinJungle]: {
    path: galoyPaths.bitcoinJungle,
    element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
    title: i18n.t("translation:choose_connector.bitcoin_jungle.title"),
    logo: galoyBitcoinJungle,
  },
  voltage: {
    path: "voltage",
    element: <ConnectVoltage />,
    title: i18n.t("translation:choose_connector.voltage.title"),
    logo: voltage,
  },
  nwc: {
    path: "nwc",
    element: <ConnectNWC />,
    title: i18n.t("translation:choose_connector.nwc.title"),
    logo: nwc,
  },
  albyhub: {
    path: "albyhub",
    element: <ConnectAlbyHub />,
    title: i18n.t("translation:choose_connector.albyhub.title"),
    logo: albyhub,
  },
  lawallet: {
    path: "lawallet",
    element: <ConnectLaWallet />,
    title: i18n.t("translation:choose_connector.lawallet.title"),
    logo: lawallet,
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
    nirvati: {
      logo: nirvati,
      children: [
        //connectorMap["citadel"],
        connectorMap["lnc"],
        //connectorMap["commando"],
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
        connectorMap["nwc"],
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
    startos: {
      logo: startos,
      children: [
        connectorMap["startos-lnd"],
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
    connectorMap["albyhub"],
    connectorMap["lnd"],
    connectorMap["lnc"],
    connectorMap["commando"],
    connectorMap["lnbits"],
    connectorMap["nwc"],
    getDistribution("umbrel"),
    getDistribution("startos"),
    getDistribution("raspiblitz"),
    getDistribution("mynode"),
    getDistribution("nirvati"),
    connectorMap["btcpay"],
    connectorMap["voltage"],
    connectorMap[galoyPaths.blink],
    connectorMap[galoyPaths.bitcoinJungle],
    connectorMap["lawallet"],
    connectorMap["lnd-hub-go"],
    connectorMap["eclair"],
  ];
}

function renderRoutes(routes: (ChildRoute | ConnectorRoute)[]) {
  return routes.map((route: ChildRoute | ConnectorRoute, index: number) => {
    if ("children" in route && route.children) {
      if ("element" in route && route.element) {
        return (
          <Route key={`${route.path}-${index}`} path={route.path}>
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
            <Route key={`${route.path}-${index}`} path={route.path}>
              <Route index element={indexRoute.element} />
              {renderRoutes(route.children)}
            </Route>
          );
        }
      }
    } else {
      return (
        <Route
          key={`${route.path}-${index}`}
          path={route.path}
          element={route.element}
        />
      );
    }
  });
}

export { ConnectorRoute, getConnectorRoutes, renderRoutes };
