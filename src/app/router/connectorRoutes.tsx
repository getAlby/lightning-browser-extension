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

import ConnectLnd from "~/app/screens/connectors/ConnectLnd";
import ConnectLndHub from "~/app/screens/connectors/ConnectLndHub";
import ConnectLnbits from "~/app/screens/connectors/ConnectLnbits";
import ConnectGaloy, { galoyUrls } from "~/app/screens/connectors/ConnectGaloy";
import ConnectEclair from "~/app/screens/connectors/ConnectEclair";
import ConnectCitadel from "~/app/screens/connectors/ConnectCitadel";
import NewWallet from "~/app/screens/connectors/NewWallet";
import ConnectUmbrel from "~/app/screens/connectors/ConnectUmbrel";
import ConnectStart9 from "~/app/screens/connectors/ConnectStart9";
import ConnectMyNode from "~/app/screens/connectors/ConnectMyNode";

const galoyPaths: { [key: string]: keyof typeof galoyUrls } = {
  bitcoinBeach: "galoy-bitcoin-beach",
  bitcoinJungle: "galoy-bitcoin-jungle",
};

export default [
  {
    path: "create-wallet",
    element: <NewWallet />,
    title: "Create a new wallet",
    description: "We create and manage a lightning wallet for you",
    logo: alby,
  },
  {
    path: "lnd",
    element: <ConnectLnd />,
    title: "LND",
    description: "Connect to your LND node",
    logo: lnd,
  },
  {
    path: "lnd-hub",
    element: <ConnectLndHub />,
    title: "LNDHub (Bluewallet)",
    description: "Connect to your Bluewallet mobile wallet",
    logo: lndhub,
  },
  {
    path: "lnbits",
    element: <ConnectLnbits />,
    title: "LNbits",
    description: "Connect to your LNbits account",
    logo: lnbits,
  },
  {
    path: "eclair",
    element: <ConnectEclair />,
    title: "Eclair",
    description: "Connect to your Eclair node",
    logo: eclair,
  },
  {
    path: "citadel",
    element: <ConnectCitadel />,
    title: "Citadel",
    description: "Connect to your local Citadel",
    logo: citadel,
  },
  {
    path: "umbrel",
    element: <ConnectUmbrel />,
    title: "Umbrel",
    description: "Connect to your Umbrel",
    logo: umbrel,
  },
  {
    path: "mynode",
    element: <ConnectMyNode />,
    title: "myNode",
    description: "Connect to your myNode",
    logo: mynode,
  },
  {
    path: "start9",
    element: <ConnectStart9 />,
    title: "Start9",
    description: "Connect to your Embassy",
    logo: start9,
  },
  {
    path: galoyPaths.bitcoinBeach,
    element: <ConnectGaloy instance={galoyPaths.bitcoinBeach} />,
    title: "Bitcoin Beach Wallet",
    description: "Create or connect to a Bitcoin Beach (Galoy) account",
    logo: galoyBitcoinBeach,
  },
  {
    path: galoyPaths.bitcoinJungle,
    element: <ConnectGaloy instance={galoyPaths.bitcoinJungle} />,
    title: "Bitcoin Jungle Wallet",
    description: "Create or connect to a Bitcoin Jungle (Galoy) account",
    logo: galoyBitcoinJungle,
  },
];
