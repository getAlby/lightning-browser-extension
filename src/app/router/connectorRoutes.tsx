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

const namespace = { ns: "welcome" };

export default [
  {
    path: "create-wallet",
    element: <NewWallet />,
    title: i18n.t("choose_connector.alby", namespace),
    description: i18n.t("choose_connector.alby_desc", namespace),
    logo: alby,
  },
  {
    path: "lnd",
    element: <ConnectLnd />,
    title: i18n.t("choose_connector.lnd", namespace),
    description: i18n.t("choose_connector.lnd_desc", namespace),
    logo: lnd,
  },
  {
    path: "lnd-hub",
    element: <ConnectLndHub />,
    title: i18n.t("choose_connector.lndhub", namespace),
    description: i18n.t("choose_connector.lndhub_desc", namespace),
    logo: lndhub,
  },
  {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: i18n.t("choose_connector.lnbits", namespace),
    description: i18n.t("choose_connector.lnbits_desc", namespace),
    logo: lnbits,
  },
  {
    path: "eclair",
    element: <ConnectEclair />,
    title: i18n.t("choose_connector.eclair", namespace),
    description: i18n.t("choose_connector.eclair_desc", namespace),
    logo: eclair,
  },
  {
    path: "citadel",
    element: <ConnectCitadel />,
    title: i18n.t("choose_connector.citadel", namespace),
    description: i18n.t("choose_connector.citadel_desc", namespace),
    logo: citadel,
  },
  {
    path: "umbrel",
    element: <ConnectUmbrel />,
    title: i18n.t("choose_connector.umbrel", namespace),
    description: i18n.t("choose_connector.umbrel_desc", namespace),
    logo: umbrel,
  },
  {
    path: "mynode",
    element: <ConnectMyNode />,
    title: i18n.t("choose_connector.mynode", namespace),
    description: i18n.t("choose_connector.mynode_desc", namespace),
    logo: mynode,
  },
  {
    path: "start9",
    element: <ConnectStart9 />,
    title: i18n.t("choose_connector.start9", namespace),
    description: i18n.t("choose_connector.start9_desc", namespace),
    logo: start9,
  },
  {
    path: "raspiblitz",
    element: <ConnectRaspiBlitz />,
    title: i18n.t("choose_connector.raspiblitz", namespace),
    description: i18n.t("choose_connector.raspiblitz_desc", namespace),
    logo: raspiblitz,
  },
  {
    path: galoyPaths.bitcoinBeach,
    element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
    title: i18n.t("choose_connector.bitcoin_beach", namespace),
    description: i18n.t("choose_connector.bitcoin_beach_desc", namespace),
    logo: galoyBitcoinBeach,
  },
  {
    path: galoyPaths.bitcoinJungle,
    element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
    title: i18n.t("choose_connector.bitcoin_jungle", namespace),
    description: i18n.t("choose_connector.bitcoin_jungle_desc", namespace),
    logo: galoyBitcoinJungle,
  },
];
