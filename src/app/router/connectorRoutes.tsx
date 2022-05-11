import lnbits from "/static/assets/icons/lnbits.png";
import lndhub from "/static/assets/icons/lndhub.png";
import lnd from "/static/assets/icons/lnd.png";
import galoyBitcoinBeach from "/static/assets/icons/galoy_bitcoin_beach.jpg";
import galoyBitcoinJungle from "/static/assets/icons/galoy_bitcoin_jungle.png";
import eclair from "/static/assets/icons/eclair.jpg";
import alby from "/static/assets/icons/alby.png";
import umbrel from "/static/assets/icons/umbrel.png";
import start9 from "/static/assets/icons/start9.png";
import citadel from "/static/assets/icons/citadel.png";
import mynode from "/static/assets/icons/mynode.png";
import raspiblitz from "/static/assets/icons/raspiblitz.png";
import ConnectLnd from "@screens/connectors/ConnectLnd";
import ConnectLndHub from "@screens/connectors/ConnectLndHub";
import ConnectLnbits from "@screens/connectors/ConnectLnbits";
import ConnectGaloy, { galoyUrls } from "@screens/connectors/ConnectGaloy";
import ConnectEclair from "@screens/connectors/ConnectEclair";
import ConnectCitadel from "@screens/connectors/ConnectCitadel";
import NewWallet from "@screens/connectors/NewWallet";
import ConnectRaspiBlitz from "@screens/connectors/ConnectRaspiBlitz";
import ConnectUmbrel from "@screens/connectors/ConnectUmbrel";
import ConnectStart9 from "@screens/connectors/ConnectStart9";
import ConnectMyNode from "@screens/connectors/ConnectMyNode";
import i18n from "~/i18n/i18nConfig";

const galoyPaths: { [key: string]: keyof typeof galoyUrls } = {
  bitcoinBeach: "galoy-bitcoin-beach",
  bitcoinJungle: "galoy-bitcoin-jungle",
};

const namespaceI18n = { ns: "welcome" };

export default [
  {
    path: "create-wallet",
    element: <NewWallet />,
    title: i18n.t("choose_connector.alby", namespaceI18n),
    description: i18n.t("choose_connector.alby_desc", namespaceI18n),
    logo: alby,
  },
  {
    path: "lnd",
    element: <ConnectLnd />,
    title: i18n.t("choose_connector.lnd", namespaceI18n),
    description: i18n.t("choose_connector.lnd_desc", namespaceI18n),
    logo: lnd,
  },
  {
    path: "lnd-hub",
    element: <ConnectLndHub />,
    title: i18n.t("choose_connector.lndhub", namespaceI18n),
    description: i18n.t("choose_connector.lndhub_desc", namespaceI18n),
    logo: lndhub,
  },
  {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: i18n.t("choose_connector.lnbits", namespaceI18n),
    description: i18n.t("choose_connector.lnbits_desc", namespaceI18n),
    logo: lnbits,
  },
  {
    path: "eclair",
    element: <ConnectEclair />,
    title: i18n.t("choose_connector.eclair", namespaceI18n),
    description: i18n.t("choose_connector.eclair_desc", namespaceI18n),
    logo: eclair,
  },
  {
    path: "citadel",
    element: <ConnectCitadel />,
    title: i18n.t("choose_connector.citadel", namespaceI18n),
    description: i18n.t("choose_connector.citadel_desc", namespaceI18n),
    logo: citadel,
  },
  {
    path: "umbrel",
    element: <ConnectUmbrel />,
    title: i18n.t("choose_connector.umbrel", namespaceI18n),
    description: i18n.t("choose_connector.umbrel_desc", namespaceI18n),
    logo: umbrel,
  },
  {
    path: "mynode",
    element: <ConnectMyNode />,
    title: i18n.t("choose_connector.mynode", namespaceI18n),
    description: i18n.t("choose_connector.mynode_desc", namespaceI18n),
    logo: mynode,
  },
  {
    path: "start9",
    element: <ConnectStart9 />,
    title: i18n.t("choose_connector.start9", namespaceI18n),
    description: i18n.t("choose_connector.start9_desc", namespaceI18n),
    logo: start9,
  },
  {
    path: "raspiblitz",
    element: <ConnectRaspiBlitz />,
    title: i18n.t("choose_connector.raspiblitz", namespaceI18n),
    description: i18n.t("choose_connector.raspiblitz_desc", namespaceI18n),
    logo: raspiblitz,
  },
  {
    path: galoyPaths.bitcoinBeach,
    element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
    title: i18n.t("choose_connector.bitcoin_beach", namespaceI18n),
    description: i18n.t("choose_connector.bitcoin_beach_desc", namespaceI18n),
    logo: galoyBitcoinBeach,
  },
  {
    path: galoyPaths.bitcoinJungle,
    element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
    title: i18n.t("choose_connector.bitcoin_jungle", namespaceI18n),
    description: i18n.t("choose_connector.bitcoin_jungle_desc", namespaceI18n),
    logo: galoyBitcoinJungle,
  },
];
